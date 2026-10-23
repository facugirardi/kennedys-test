import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '500px'
}

const initialCenter = {
    lat: 37.4220,
    lng: -122.0841
}



export default function GoogleMapsDraggablePinWithGeocoding({ propertyData, defaultValue }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places']
    })

    const [map, setMap] = useState(null)
    const [markerPosition, setMarkerPosition] = useState(defaultValue || initialCenter)
    const [geocoder, setGeocoder] = useState(null)
    const [country, setCountry] = useState('')
    const [region, setRegion] = useState('')
    const [location, setLocation] = useState('')

    useEffect(() => {
        if (isLoaded && !geocoder) {
            setGeocoder(new google.maps.Geocoder())
        }
    }, [isLoaded, geocoder])

    const onLoad = useCallback(function callback(map) {

        const bounds = new window.google.maps.LatLngBounds(defaultValue?.coordinates || defaultValue || initialCenter)
        map.fitBounds(bounds)
        setMap(map)
    }, [])

    const onUnmount = useCallback(function callback(map) {
        setMap(null)
    }, [])

    const reverseGeocode = useCallback((latLng) => {
        if (geocoder) {
            geocoder.geocode({ location: latLng }, (results, status) => {
                if (status !== 'OK' || !results || !results[0]) {
                    console.error('Geocoder failed due to: ' + status)
                }
            })
        }
    }, [geocoder])

    const onMarkerDragEnd = useCallback((e) => {
        if (e.latLng) {
            setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            reverseGeocode(e.latLng)
        }
    }, [reverseGeocode])

    const handleLocationUpdate = () => {
        if (geocoder) {
            const address = `${location}, ${region}, ${country}`
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const latLng = results[0].geometry.location
                    setMarkerPosition({ lat: latLng.lat(), lng: latLng.lng() })
                    reverseGeocode(latLng)
                    if (map) {
                        map.panTo(latLng)
                    }
                } else {
                    console.error('Geocoding failed due to: ' + status)
                }
            })
        }
    }

    useEffect(() => {
        handleLocationUpdate()
    }, [
        country, region, location
    ])


    useEffect(() => {
        if (propertyData) {
            setCountry(propertyData?.country)
            setRegion(propertyData?.region)
            setLocation(propertyData?.address)
            setMarkerPosition(propertyData?.coordinates)
        } else if (defaultValue) {
            setCountry(defaultValue?.country)
            setRegion(defaultValue?.region || '')
            setLocation(defaultValue?.location)
            setMarkerPosition(defaultValue?.coordinates)
        }


    }, [])


    if (loadError) {
        return <div>Map cannot be loaded right now, sorry.</div>
    }

    return isLoaded ? (
        <>
            <div className="w-full mx-auto mt-8">

                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPosition}
                    zoom={10}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                    />
                </GoogleMap>
            </div>
        </>

    ) : <div>Loading...</div>
}