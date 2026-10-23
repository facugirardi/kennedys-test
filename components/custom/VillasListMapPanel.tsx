import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { resolveMediaUrl, heroImageDirectUrl } from '@/lib/utils';

const DEFAULT_MAP_HEIGHT = '88vh';
const DEFAULT_CENTER = { lat: 37.4467, lng: 25.3289 };
const GOOGLE_MAPS_LOADER_ID = 'google-map-script';
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
const BASE_ZOOM = 10;
const BASE_RADIUS = 1500; // metros a zoom BASE_ZOOM → tamaño visual constante en todos los zooms

function getRadiusForZoom(zoom: number): number {
  return Math.round(BASE_RADIUS * Math.pow(2, BASE_ZOOM - zoom));
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getVillaGuestDisplay(villa: any): string | number {
  const c = villa?.classification;
  const maxP = c?.maxPersons;
  const ideal = c?.idealPersons;
  const positive = [maxP, ideal].find(
    (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
  );
  if (positive !== undefined) return positive;
  if (typeof maxP === 'number' && Number.isFinite(maxP)) return maxP;
  if (typeof ideal === 'number' && Number.isFinite(ideal)) return ideal;
  const raw = villa?.guests;
  if (raw == null || raw === '') return 'N/A';
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const digits = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
  if (!Number.isNaN(digits) && digits > 0) return digits;
  return String(raw).trim() || 'N/A';
}

function hasValidCoordinates(property: any): boolean {
  const coords = property?.coordinates;
  return (
    coords != null &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !Number.isNaN(coords.lat) &&
    !Number.isNaN(coords.lng) &&
    // Restrict to Europe / Mediterranean — excludes Africa, Asia, Americas
    coords.lat > 25 && coords.lat < 55 &&
    coords.lng > -10 && coords.lng < 45
  );
}

export interface VillasListMapPanelProps {
  properties: any[];
  activeProperty: any | null;
  onMarkerClick: (property: any | null) => void;
  onViewDetails: (property: any) => void;
  /** Overrides the map's height (e.g. `calc(100vh - <filters bar height>px)` so it fills the sticky column exactly). */
  containerHeight?: string;
}

export default function VillasListMapPanel({
  properties,
  onViewDetails,
  containerHeight,
}: VillasListMapPanelProps) {
  const mapContainerStyle = useMemo(
    () => ({ width: '100%', height: containerHeight || DEFAULT_MAP_HEIGHT }),
    [containerHeight]
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const circlesRef = useRef<any[]>([]);
  const hasFittedRef = useRef(false);
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const mappedProperties = useMemo(
    () => properties.filter(hasValidCoordinates),
    [properties]
  );

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google || !isLoaded) {
      return;
    }

    // Limpiar círculos y listener de zoom anteriores
    if (zoomListenerRef.current) {
      google.maps.event.removeListener(zoomListenerRef.current);
      zoomListenerRef.current = null;
    }
    circlesRef.current.forEach((c) => {
      google.maps.event.clearInstanceListeners(c);
      c.setMap(null);
    });
    circlesRef.current = [];

    if (mappedProperties.length === 0) {
      if (!hasFittedRef.current) {
        map.setCenter(DEFAULT_CENTER);
        map.setZoom(6);
      }
      return;
    }

    const currentZoom = map.getZoom() ?? BASE_ZOOM;
    const initialRadius = getRadiusForZoom(currentZoom);

    const newCircles: any[] = [];
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow({ maxWidth: 230 });

    infoWindow.addListener('domready', () => {
      const d = document.querySelector('.gm-style-iw-d') as HTMLElement | null;
      if (d) { d.style.overflow = 'hidden'; d.style.padding = '0'; }
      const c = document.querySelector('.gm-style-iw-c') as HTMLElement | null;
      if (c) { c.style.padding = '0'; c.style.overflow = 'hidden'; c.style.borderRadius = '0'; c.style.boxShadow = '0 4px 20px rgba(23,35,56,0.18)'; }
      const chr = document.querySelector('.gm-style-iw-chr') as HTMLElement | null;
      if (chr) chr.style.display = 'none';
      const closeBtn = document.querySelector('.gm-ui-hover-effect') as HTMLElement | null;
      if (closeBtn) closeBtn.style.display = 'none';
    });

    mappedProperties.forEach((property) => {
      if (!property.coordinates) return;

      const latLng = new google.maps.LatLng(
        property.coordinates.lat,
        property.coordinates.lng
      );

      const circle = new (window as any).google.maps.Circle({
        center: latLng,
        radius: initialRadius,
        strokeColor: '#D99330',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        fillColor: '#D99330',
        fillOpacity: 0.25,
        clickable: true,
        draggable: false,
        editable: false,
        zIndex: 1,
        map,
      });

      circle.addListener('click', () => {
        onViewDetails(property);
      });

      circle.addListener('mouseover', () => {
        const raw = property.images?.[0]?.urlImage || property.images?.[0]?.url || '';
        const imgUrl = raw && /^https?:\/\//i.test(raw) ? raw : resolveMediaUrl(raw);
        const imageSrc =
          imgUrl && imgUrl.trim() !== '' ? heroImageDirectUrl(imgUrl) : '/images/villa-detail@2x.png';

        const title = escapeHtml(property.title || property.name || 'Villa');
        const location = escapeHtml(
          property.visibleLocation || property.location || property.country || ''
        );
        const bedrooms = escapeHtml(property.classification?.bedrooms ?? 'N/A');
        const guests = escapeHtml(getVillaGuestDisplay(property));

        infoWindow.setContent(`
          <div style="width:230px;cursor:pointer;overflow:hidden;background:#fff;">
            <img
              src="${escapeHtml(imageSrc)}"
              alt="${title}"
              style="width:100%;height:145px;object-fit:cover;display:block;"
              onerror="this.src='/images/villa-detail@2x.png'"
            />
            <div style="padding:12px 14px 14px;border-top:2px solid #D99330;">
              <p style="margin:0 0 3px;font-family:sans-serif;font-size:10px;font-weight:600;color:#506A70;text-transform:uppercase;letter-spacing:0.08em;">${location}</p>
              <p style="margin:0 0 8px;font-family:sans-serif;font-size:13px;font-weight:600;color:#172338;line-height:1.3;letter-spacing:0.01em;">${title}</p>
              <p style="margin:0;font-family:sans-serif;font-size:13px;font-weight:700;color:#D99330;letter-spacing:0.02em;">${bedrooms} bed · ${guests} guests</p>
            </div>
          </div>
        `);
        infoWindow.setPosition(property.coordinates);
        infoWindow.open(map);
      });

      circle.addListener('mouseout', () => {
        infoWindow.close();
      });

      newCircles.push(circle);
      bounds.extend(latLng);
    });

    circlesRef.current = newCircles;

    // Radio adaptativo al hacer zoom: tamaño visual ~constante
    zoomListenerRef.current = map.addListener('zoom_changed', () => {
      const zoom = map.getZoom() ?? BASE_ZOOM;
      const r = getRadiusForZoom(zoom);
      circlesRef.current.forEach((c) => c.setRadius(r));
    });

    // fitBounds solo la primera vez que hay datos — evita saltar a África en updates posteriores
    if (!hasFittedRef.current) {
      hasFittedRef.current = true;
      const tid = window.setTimeout(() => {
        try {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          const latSpan = ne.lat() - sw.lat();
          const lngSpan = ne.lng() - sw.lng();

          // If the bounding box spans more than 8° it means outlier coords slipped through —
          // fall back to the Mykonos default rather than zooming out to include Africa.
          if (latSpan > 8 || lngSpan > 8) {
            map.setCenter(DEFAULT_CENTER);
            map.setZoom(BASE_ZOOM);
          } else {
            map.fitBounds(bounds, 100);
            const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
              const zoom = map.getZoom();
              if (zoom && zoom > 12) map.setZoom(12);
              else if (zoom && zoom < 7) map.setZoom(7);
              google.maps.event.removeListener(listener);
            });
          }
        } catch (e) {
          console.error('Error fitting map bounds:', e);
        }
      }, 300);

      return () => {
        window.clearTimeout(tid);
        infoWindow.close();
        if (zoomListenerRef.current) {
          google.maps.event.removeListener(zoomListenerRef.current);
          zoomListenerRef.current = null;
        }
        circlesRef.current.forEach((c) => {
          google.maps.event.clearInstanceListeners(c);
          c.setMap(null);
        });
        circlesRef.current = [];
      };
    }

    return () => {
      infoWindow.close();
      if (zoomListenerRef.current) {
        google.maps.event.removeListener(zoomListenerRef.current);
        zoomListenerRef.current = null;
      }
      circlesRef.current.forEach((c) => {
        google.maps.event.clearInstanceListeners(c);
        c.setMap(null);
      });
      circlesRef.current = [];
    };
  }, [map, isLoaded, mappedProperties.length, onViewDetails]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleMapUnmount = useCallback(() => {
    hasFittedRef.current = false;
    setMap(null);
  }, []);

  if (!apiKey) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
        Map view is unavailable. Google Maps API key is not configured.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
        Map cannot be loaded right now. Please try again later.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="px-4 py-6 text-sm text-neutral-600">Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={DEFAULT_CENTER}
      zoom={BASE_ZOOM}
      onLoad={handleMapLoad}
      onUnmount={handleMapUnmount}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }], // Ocultar restaurantes y otros puntos de interés de Google
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
        ],
      }}
    />
  );
}
