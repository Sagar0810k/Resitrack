"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Car, MapPin } from 'lucide-react'


const icon = L.icon({
  iconUrl: '/leaflet/marker-icon.png', // Placeholder URL
  shadowUrl: '/leaflet/marker-shadow.png', // Placeholder URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = icon
// -------------------------------------

// --- Types ---
interface Coordinates {
  lat: number
  lng: number
  accuracy?: number
}

interface LiveMapProps {
  // Initial location to center the map (e.g., driver location or a city center)
  initialCenter: Coordinates
  // The driver's live coordinates
  driverLocation: Coordinates
  // Callback to signal when the component closes
  onClose: () => void
}

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable"

// --- Component for User Geolocation ---
const UserLocationMarker: React.FC<{
  userLocation: Coordinates | null
  setLocation: (loc: Coordinates) => void
  setStatus: (status: LocationStatus) => void
}> = ({ userLocation, setLocation, setStatus }) => {
  const map = useMapEvents({
    // Only run on initial load or if permission state changes
    locationfound(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: e.accuracy })
      setStatus('granted')
      map.flyTo(e.latlng, map.getZoom() < 15 ? 15 : map.getZoom())
    },
    locationerror(e) {
      console.error("Geolocation Error:", e.message)
      setStatus('denied')
    },
  })

  // Start the location request on mount
  useEffect(() => {
    setStatus('requesting')
    map.locate({ watch: true, enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
    
    // Cleanup function: stop watching location when component unmounts
    return () => {
        // Clear all watchers (less precise than using a watchId, but safer in this context)
        map.stopLocate() 
    }
  }, [map, setLocation, setStatus])


  // Custom Icon for User
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="display: flex; flex-direction: column; align-items: center;">
             <div style="background-color: #007bff; color: white; border-radius: 50%; padding: 6px; box-shadow: 0 0 0 5px rgba(0, 123, 255, 0.4);">
               <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9A1.998 1.998 0 0110 19.414V4.586a1.998 1.998 0 013.414-1.486l4.243 4.243a1 1 0 010 1.414z"/>
               </svg>
             </div>
             <div style="font-size: 10px; color: #007bff; font-weight: 600; margin-top: 4px;">You</div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

  return userLocation === null || map.getZoom() === undefined ? null : (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        Your Live Location
        {userLocation.accuracy && <p>Accuracy: &plusmn;{userLocation.accuracy.toFixed(1)}m</p>}
      </Popup>
    </Marker>
  )
}


// --- Main LiveMap Component ---
export const LiveMap: React.FC<LiveMapProps> = ({ initialCenter, driverLocation }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle")
  
  // Custom Icon for Driver
  const driverIcon = L.divIcon({
    className: 'custom-driver-marker',
    html: `<div style="display: flex; flex-direction: column; align-items: center;">
             <div style="background-color: #dc3545; color: white; border-radius: 50%; padding: 6px; box-shadow: 0 0 0 5px rgba(220, 53, 69, 0.4);">
               <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v4a2 2 0 002 2h14a2 2 0 002-2v-4M3 10L1 6a2 2 0 012-2h18a2 2 0 012 2l-2 4M3 10h18M7 16l-1 4h12l-1-4M9 20h6"/>
               </svg>
             </div>
             <div style="font-size: 10px; color: #dc3545; font-weight: 600; margin-top: 4px;">Driver</div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
  
  // Handle status messages
  const statusMessage = (() => {
    switch (locationStatus) {
      case "requesting": return "Requesting location permission..."
      case "granted": return "Tracking live location."
      case "denied": return "Location permission denied. Check browser settings."
      case "unavailable": return "Geolocation not available on this device."
      default: return ""
    }
  })()

  return (
    <div className="w-full h-full">
      <div className="p-2 bg-white dark:bg-gray-800 text-sm border-b">
        <p className={`font-semibold ${locationStatus === 'denied' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
          {statusMessage}
        </p>
      </div>
      
      <MapContainer 
        center={initialCenter} 
        zoom={14} 
        scrollWheelZoom={true}
        className="h-[500px] w-full z-0" // Set a fixed height
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver Marker */}
        <Marker position={driverLocation} icon={driverIcon}>
          <Popup>Driver Location: Approaching soon!</Popup>
        </Marker>

        {/* User Marker (Handles Geolocation logic internally) */}
        <UserLocationMarker 
          userLocation={userLocation} 
          setLocation={setUserLocation} 
          setStatus={setLocationStatus}
        />
        
      </MapContainer>
    </div>
  )
}