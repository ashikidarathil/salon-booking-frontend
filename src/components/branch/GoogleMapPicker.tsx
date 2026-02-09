'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MapLocation } from '@/features/branch/branch.types';

interface GoogleMapPickerProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: MapLocation & { address: string }) => void;
  initialLocation?: MapLocation;
  title?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function GoogleMapPicker({
  open,
  onClose,
  onLocationSelect,
  initialLocation,
  title = 'Select Branch Location',
}: GoogleMapPickerProps) {
  const [latitude, setLatitude] = useState<number>(initialLocation?.latitude || 19.076);
  const [longitude, setLongitude] = useState<number>(initialLocation?.longitude || 72.8777);
  const [address, setAddress] = useState<string>('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  // ✅ Check API key on mount
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setApiKeyError(
        'Google Maps API key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env file.',
      );
    }
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setLatitude(initialLocation.latitude);
      setLongitude(initialLocation.longitude);
    }
  }, [initialLocation, open]);

  // Reset address when modal closes
  useEffect(() => {
    if (!open) {
      setAddress('');
    }
  }, [open]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setLatitude(newLat);
        setLongitude(newLng);

        if (map) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results) => {
            if (results && results[0]) {
              setAddress(results[0].formatted_address);
            }
          });
        }
      }
    },
    [map],
  );

  const handleSearchBoxPlacesChanged = useCallback(() => {
    if (!searchBoxRef.current) return;

    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        setLatitude(newLat);
        setLongitude(newLng);
        setAddress(place.formatted_address || '');

        if (map) {
          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(15);
        }
      }
    }
  }, [map]);

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setLatitude(newLat);
        setLongitude(newLng);

        // Reverse geocode to get address
        if (map) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setAddress(results[0].formatted_address);
            }
          });
        }
      }
    },
    [map],
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results) => {
            if (results && results[0]) {
              setAddress(results[0].formatted_address);
            }
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
    );
  }, [map]);

  const handleConfirm = useCallback(() => {
    onLocationSelect({
      latitude,
      longitude,
      address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    });
    onClose();
  }, [latitude, longitude, address, onLocationSelect, onClose]);

  const handleLatitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!Number.isNaN(value) && value >= -90 && value <= 90) {
      setLatitude(value);
    }
  }, []);

  const handleLongitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!Number.isNaN(value) && value >= -180 && value <= 180) {
      setLongitude(value);
    }
  }, []);

  // ✅ Show error if API key is missing
  if (apiKeyError) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl ">
          <DialogHeader>
            <DialogTitle>Configuration Error</DialogTitle>
          </DialogHeader>
          <div className="p-4 border border-red-200 rounded bg-red-50">
            <p className="mb-2 font-semibold text-red-800">❌ {apiKeyError}</p>
            <p className="text-sm text-red-700">Steps to fix:</p>
            <ol className="mt-2 space-y-1 text-sm text-red-700 list-decimal list-inside">
              <li>Create `.env` file in project root</li>
              <li>Add: VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY</li>
              <li>Get key from Google Cloud Console</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto theme-admin">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Search for a place, click on the map, or use your current location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <StandaloneSearchBox
            onLoad={(ref) => {
              searchBoxRef.current = ref;
            }}
            onPlacesChanged={handleSearchBoxPlacesChanged}
          >
            <Input
              type="text"
              placeholder="Search for a place..."
              autoComplete="serach"
              className="w-full mb-4"
              style={{
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
          </StandaloneSearchBox>

          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: latitude, lng: longitude }}
            zoom={13}
            onLoad={setMap}
            onClick={handleMapClick}
          >
            <Marker 
              position={{ lat: latitude, lng: longitude }}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          </GoogleMap>

          {address && (
            <div className="p-3 border border-blue-200 rounded bg-blue-50">
              <p className="text-sm text-blue-900">{address}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={latitude}
                onChange={handleLatitudeChange}
                placeholder="Latitude"
              />
              <p className="mt-1 text-xs text-gray-500">{latitude.toFixed(6)}</p>
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={longitude}
                onChange={handleLongitudeChange}
                placeholder="Longitude"
              />
              <p className="mt-1 text-xs text-gray-500">{longitude.toFixed(6)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUseMyLocation}>
              📍 Use My Location
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="ml-auto">
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
