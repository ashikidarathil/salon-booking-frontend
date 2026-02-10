'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
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
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapPickerProps {
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

function LocationMarker({
  position,
  setPosition,
  onPositionChange,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const pos = marker.getLatLng();
        const newPos: [number, number] = [pos.lat, pos.lng];
        setPosition(newPos);
        onPositionChange(pos.lat, pos.lng);
      }
    },
  };

  return <Marker ref={markerRef} position={position} draggable={true} eventHandlers={eventHandlers} />;
}

function SearchControl({ onSearch, isSearching }: { onSearch: (query: string) => void; isSearching: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isSearching) {
      onSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for a place..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          disabled={isSearching}
        />
        <Button type="submit" variant="outline" disabled={isSearching}>
          {isSearching ? '...' : 'Search'}
        </Button>
      </div>
    </form>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function LeafletMapPicker({
  open,
  onClose,
  onLocationSelect,
  initialLocation,
  title = 'Select Branch Location',
}: LeafletMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : [19.076, 72.8777]
  );
  const [address, setAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLocation && open) {
      setPosition([initialLocation.latitude, initialLocation.longitude]);
    }
  }, [initialLocation, open]);

  useEffect(() => {
    if (!open) {
      setAddress('');
      setSearchError(null);
      setIsSearching(false);
    }
  }, [open]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'SalonBookingApp/1.0',
          },
        }
      );
      const data = await response.json();
      setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const searchLocation = useCallback(async (query: string) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'SalonBookingApp/1.0',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment.');
        }
        throw new Error('Search service unavailable');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const newPos: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
        setPosition(newPos);
        setAddress(result.display_name);
      } else {
        setSearchError('No results found for this location');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search location');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const newPos: [number, number] = [lat, lng];
        setPosition(newPos);
        reverseGeocode(lat, lng);
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  }, [reverseGeocode]);

  const handleConfirm = useCallback(() => {
    onLocationSelect({
      latitude: position[0],
      longitude: position[1],
      address: address || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`,
    });
    onClose();
  }, [position, address, onLocationSelect, onClose]);

  const handleLatitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!Number.isNaN(value) && value >= -90 && value <= 90) {
      setPosition([value, position[1]]);
      reverseGeocode(value, position[1]);
    }
  }, [position, reverseGeocode]);

  const handleLongitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!Number.isNaN(value) && value >= -180 && value <= 180) {
      setPosition([position[0], value]);
      reverseGeocode(position[0], value);
    }
  }, [position, reverseGeocode]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto theme-admin">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Search for a place, click on the map, drag the marker, or use your current location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <SearchControl onSearch={searchLocation} isSearching={isSearching} />
            {searchError && <p className="text-sm text-red-500 font-medium">{searchError}</p>}
          </div>

          <MapContainer
            center={position}
            zoom={13}
            style={mapContainerStyle}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              onPositionChange={handlePositionChange}
            />
            <MapUpdater center={position} />
          </MapContainer>

          {address && (
            <div className="p-3 border border-blue-200 rounded bg-blue-50">
              <p className="text-sm text-blue-900">
                {isGeocoding ? 'Loading address...' : address}
              </p>
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
                value={position[0]}
                onChange={handleLatitudeChange}
                placeholder="Latitude"
              />
              <p className="mt-1 text-xs text-gray-500">{position[0].toFixed(6)}</p>
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={position[1]}
                onChange={handleLongitudeChange}
                placeholder="Longitude"
              />
              <p className="mt-1 text-xs text-gray-500">{position[1].toFixed(6)}</p>
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
