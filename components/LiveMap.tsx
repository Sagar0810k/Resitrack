"use client"

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'


// --- LEAFLET ICON SETUP AND CUSTOM ICONS ---
// Fix for default marker icons not showing up (common issue in React/Next.js Leaflet setup)
const defaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png', 
  shadowUrl: '/leaflet/marker-shadow.png', 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = defaultIcon

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


// --- Types ---
interface Coordinates {
  lat: number
  lng: number
  accuracy?: number
}

interface LiveMapDialogProps {
  initialCenter: Coordinates, 
  driverLocation: Coordinates,
  isMapModalOpen: boolean,
  closeMapModal: () => void
}

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable"

// --- Component for User Geolocation (Child of MapContainer) ---
const UserLocationMarker: React.FC<{
  userLocation: Coordinates | null
  setLocation: (loc: Coordinates) => void
  setStatus: (status: LocationStatus) => void
  isMapOpen: boolean 
}> = ({ userLocation, setLocation, setStatus, isMapOpen }) => {
  const map = useMapEvents({}) 

  // Combined location logic: start locating when map opens, stop when it closes
  useEffect(() => {
    // 1. If map is closed, or if geolocation is not supported, stop and return
    if (!isMapOpen) {
      map.stopLocate()
      return
    }

    if (!navigator.geolocation) {
        setStatus("unavailable")
        return
    }

    // 2. Setup listeners and start watch
    setStatus('requesting')

    const onLocationFound = (e: L.LocationEvent) => {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: e.accuracy })
        setStatus('granted')
        // Automatically pan/zoom to user's location on success
        map.flyTo(e.latlng, map.getZoom() < 15 ? 15 : map.getZoom())
    }

    const onLocationError = (e: L.ErrorEvent) => {
        console.error("Geolocation Error:", e.message)
        setStatus('denied')
        setLocation(null); // Clear location on error
    }

    map.on('locationfound', onLocationFound)
    map.on('locationerror', onLocationError)

    // Start watching position
    map.locate({ watch: true, enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
    
    // 3. Cleanup function: stop watching location when component unmounts or map closes
    return () => {
        map.off('locationfound', onLocationFound)
        map.off('locationerror', onLocationError)
        map.stopLocate() 
    }
  }, [map, isMapOpen, setLocation, setStatus])


  return userLocation === null ? null : (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        Your Live Location
        {userLocation.accuracy && <p>Accuracy: &plusmn;{userLocation.accuracy.toFixed(1)}m</p>}
      </Popup>
    </Marker>
  )
}

// --- Main LiveMap Component (Wrapper inside Dialog) ---
export const LiveMapDialog: React.FC<LiveMapDialogProps> = ({ initialCenter, driverLocation, isMapModalOpen, closeMapModal }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle")
  
  // Handle status messages
  const statusMessage = (() => {
    switch (locationStatus) {
      case "requesting": return "Requesting location permission..."
      case "granted": return "Tracking live location."
      case "denied": return "Location permission denied. Please enable location services."
      case "unavailable": return "Geolocation not available on this device."
      default: return ""
    }
  })()
  
  const handleDialogClose = () => {
      // When dialog closes, reset states for next time and call the parent's close function
      setUserLocation(null)
      setLocationStatus("idle")
      closeMapModal()
  }

  return (
    // Use the existing Dialog component structure
    <Dialog open={isMapModalOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
            <DialogTitle>Live Ride Map</DialogTitle>
            <Button onClick={handleDialogClose} variant="ghost" size="icon" className="h-8 w-8">
               <X className="h-4 w-4" />
            </Button>
         </div>
         <DialogDescription className="px-4 pb-2">Track your driver's location and your current position.</DialogDescription>
        
        <div className="w-full h-[500px] relative">
            <div className="absolute top-0 left-0 right-0 p-2 bg-white dark:bg-gray-800 text-sm border-b z-[500]">
                <p className={`font-semibold ${locationStatus === 'denied' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {statusMessage}
                </p>
            </div>
            
            {/* The Map Container with Leaflet */}
            <MapContainer 
              center={initialCenter} 
              zoom={14} 
              scrollWheelZoom={true}
              className="h-full w-full z-0"
              // Key forces the map to re-initialize when the dialog opens/closes
              key={isMapModalOpen ? 'map-open' : 'map-closed'} 
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
                isMapOpen={isMapModalOpen}
              />
              
            </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
}