"use client";
import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Circle, Libraries } from '@react-google-maps/api';
import { getCoordinatesFromGoogleMapUrl } from '@/lib/api/map';

const containerStyle = {
  width: '100%',
  height: '100%'
};
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

interface PropertyLocationMapProps {
  googleMapUrl?: string | null;
  location?: string;
  title?: string;
}

const DEFAULT_CENTER = { lat: 37.9838, lng: 23.7275 };

// Función para extraer coordenadas de googleMapUrl usando el endpoint del backend (igual que en Loggia)
const extractCoordinatesFromUrl = async (url: string | null | undefined): Promise<{ lat: number; lng: number } | null> => {
  if (!url) {
    return null;
  }

  try {
    // Usar el mismo endpoint que usa Loggia para resolver short URLs y extraer coordenadas
    const result = await getCoordinatesFromGoogleMapUrl(url);
    
    if (result?.success && result?.data) {
      const { lat, lng } = result.data;
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch (error) {
    console.error('❌ [PropertyLocationMap] Error extracting coordinates from URL:', error);
  }

  return null;
};

const extractCoordinatesFromRawUrl = (url: string | null | undefined): { lat: number; lng: number } | null => {
  if (!url || typeof url !== 'string') return null;

  const candidates = [url];
  try {
    candidates.push(decodeURIComponent(url));
  } catch {
    // Ignore malformed URI sequences; keep raw URL only.
  }

  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /\/maps\/search\/(-?\d+(?:\.\d+)?)[,\s+]+(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const candidate of candidates) {
    for (const pattern of patterns) {
      const match = candidate.match(pattern);
      if (!match) continue;
      const lat = Number.parseFloat(match[1]);
      const lng = Number.parseFloat(match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
};

// Función para geocodificar una dirección (fallback si no hay coordenadas)
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!window.google || !window.google.maps) return null;

  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng()
        });
      } else {
        resolve(null);
      }
    });
  });
};

export default function PropertyLocationMap({ googleMapUrl, location, title }: PropertyLocationMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Extraer coordenadas del googleMapUrl o geocodificar la dirección
  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;

    const extractAndSetCoords = async () => {
      const hasGoogleMapUrl = typeof googleMapUrl === 'string' && googleMapUrl.trim().length > 0;

      // Primero intentar parse local de la URL (rápido)
      const coordsFromRaw = extractCoordinatesFromRawUrl(googleMapUrl);
      if (coordsFromRaw && isMounted) {
        setCenter(coordsFromRaw);
        return;
      }

      // Luego resolver vía backend para short URLs de Google Maps
      const coordsFromUrl = await extractCoordinatesFromUrl(googleMapUrl);
      if (coordsFromUrl && isMounted) {
        setCenter(coordsFromUrl);
        return;
      }

      // Igual que Loggia: si falla backend, geocodificar el propio googleMapUrl.
      // Esto evita caer en una geocodificación por location más ambigua.
      if (hasGoogleMapUrl && isMounted) {
        const coordsFromMapUrlGeocode = await geocodeAddress(googleMapUrl!.trim());
        if (coordsFromMapUrlGeocode && isMounted) {
          setCenter(coordsFromMapUrlGeocode);
          return;
        }
      }

      // Fallback secundario: geocodificar location textual.
      if (location && window.google && window.google.maps && isMounted) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
          if (isMounted && status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const coords = {
              lat: location.lat(),
              lng: location.lng()
            };
            setCenter(coords);
            return;
          }
          if (isMounted) setCenter(DEFAULT_CENTER);
        });
        return;
      }

      if (isMounted) setCenter(DEFAULT_CENTER);
    };

    extractAndSetCoords();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, googleMapUrl, location]);

  // Radio del círculo: 200 metros
  const circleRadius = 200; // 200 metros

  // Opciones del círculo - hacer más visible
  const circleOptions = {
    strokeColor: '#D99330', // Color del borde (naranja de la marca)
    strokeOpacity: 1.0, // Más opaco para que sea visible
    strokeWeight: 3, // Más grueso
    fillColor: '#D99330', // Color de relleno
    fillOpacity: 0.25, // Más visible pero aún transparente
    clickable: false,
    draggable: false,
    editable: false,
    zIndex: 1
  };

  const primaryLine = location?.trim() || "";
  const secondaryLine =
    title?.trim() && title.trim() !== primaryLine ? title.trim() : "";
  const hasLabel = Boolean(primaryLine || secondaryLine);

  const locationCalloutBox = (
    <div className="max-w-[18rem] border border-[#DEE3E7] bg-white px-3 py-2.5 shadow-md print:max-w-[16rem] print:px-2.5 print:py-2">
      <p className="m-0 font-haas text-[9px] font-medium uppercase tracking-[0.12em] text-[#506A70] print:text-[8px]">
        Location
      </p>
      {primaryLine ? (
        <p className="mb-0 mt-1 font-haas text-[12px] font-light leading-snug text-[#172338] print:mt-0.5 print:text-[11px]">
          {primaryLine}
        </p>
      ) : null}
      {secondaryLine ? (
        <p
          className={`mb-0 font-haas font-light leading-snug print:text-[10px] ${
            primaryLine
              ? "mt-1 text-[11px] text-[#506A70]"
              : "mt-1 text-[12px] text-[#172338] print:text-[11px]"
          }`}
        >
          {secondaryLine}
        </p>
      ) : null}
    </div>
  );

  const floatingCallout = hasLabel ? (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1] max-w-[min(calc(100%-1.5rem),18rem)] print:max-w-[16rem]">
      {locationCalloutBox}
    </div>
  ) : null;

  const centerIsValid =
    center &&
    typeof center.lat === 'number' &&
    typeof center.lng === 'number' &&
    !isNaN(center.lat) &&
    !isNaN(center.lng);

  if (loadError) {
    return (
      <div className="relative flex h-full w-full items-center justify-center font-haas text-sm text-[#506A70]">
        Map cannot be loaded right now, sorry.
        {floatingCallout}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[#F4F6F8] font-haas text-sm text-[#506A70]">
        Loading map...
        {floatingCallout}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }] // Ocultar puntos de interés para más privacidad
            }
          ]
        }}
      >
        {centerIsValid && (
          <Circle
            key={`circle-${center.lat}-${center.lng}`}
            center={center}
            radius={circleRadius}
            options={circleOptions}
          />
        )}
      </GoogleMap>
      {!centerIsValid || !hasLabel ? floatingCallout : null}
    </div>
  );
}

