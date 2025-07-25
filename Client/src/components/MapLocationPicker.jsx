import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons in React
const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
});

export default function MapLocationPicker({
    coordinates,
    onCoordinatesChange,
    onLocationNameChange,
    onLocationDetailsChange,
    address = '',
    onAddressChange
}) {
    const [searchValue, setSearchValue] = useState(address);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [locationInput, setLocationInput] = useState('');

    // Map click handler component
    function LocationMarker() {
        useMapEvents({
            click(e) {
                const newPosition = [e.latlng.lat, e.latlng.lng];
                setSelectedPosition(newPosition);

                if (onCoordinatesChange) {
                    onCoordinatesChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
                }

                // Reverse geocode to get location name
                reverseGeocode(e.latlng.lat, e.latlng.lng);
            },
        });
        return selectedPosition ? <Marker position={selectedPosition} icon={markerIcon} /> : null;
    }

    // Helper component to recenter map
    function RecenterMap({ position }) {
        const map = useMap();
        useEffect(() => {
            if (position) {
                map.setView(position);
            }
        }, [position, map]);
        return null;
    }

    // Location search function using Nominatim API
    const searchLocation = async (query) => {
        if (!query || query.length < 3) {
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=1&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);

                // Update map position and coordinates
                const newPosition = [lat, lon];
                setSelectedPosition(newPosition);

                if (onCoordinatesChange) {
                    onCoordinatesChange({ latitude: lat, longitude: lon });
                }

                if (onLocationNameChange) {
                    onLocationNameChange(location.display_name);
                }

                // Update the address input
                if (onAddressChange) {
                    onAddressChange(location.display_name);
                }

                // Extract city and country from search result
                if (onLocationDetailsChange && location.address) {
                    const address = location.address;
                    const city = address.city ||
                        address.town ||
                        address.village ||
                        address.municipality ||
                        address.county ||
                        address.state_district ||
                        address.state ||
                        '';
                    const country = address.country || '';

                    onLocationDetailsChange({
                        city: city,
                        country: country,
                        fullAddress: location.display_name,
                        addressComponents: address
                    });
                }

                setLocationInput(location.display_name);
            }
        } catch (error) {
            console.error("Error searching location:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Reverse geocoding function to get location name from coordinates
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.display_name) {
                setLocationInput(data.display_name);
                if (onLocationNameChange) {
                    onLocationNameChange(data.display_name);
                }

                // Update the address input
                if (onAddressChange) {
                    onAddressChange(data.display_name);
                }

                // Extract city and country from address components
                if (onLocationDetailsChange && data.address) {
                    const address = data.address;
                    const city = address.city ||
                        address.town ||
                        address.village ||
                        address.municipality ||
                        address.county ||
                        address.state_district ||
                        address.state ||
                        '';
                    const country = address.country || '';

                    onLocationDetailsChange({
                        city: city,
                        country: country,
                        fullAddress: data.display_name,
                        addressComponents: address
                    });
                }
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            // Fallback to coordinates if reverse geocoding fails
            setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onAddressChange) {
            onAddressChange(value);
        }
    };

    // Handle location search button click
    const handleLocationSearchClick = () => {
        if (searchValue && searchValue.length >= 3) {
            searchLocation(searchValue);
        }
    };

    // Handle search input key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLocationSearchClick();
        }
    };

    // Set initial position based on coordinates prop
    useEffect(() => {
        if (coordinates?.latitude && coordinates?.longitude) {
            const newPosition = [coordinates.latitude, coordinates.longitude];
            setSelectedPosition(newPosition);
            // Get location name for display
            reverseGeocode(coordinates.latitude, coordinates.longitude);
        } else {
            // Set default location (you can customize this)
            const defaultPosition = [55.1694, 23.8813]; // Lithuania as default
            setSelectedPosition(defaultPosition);
            if (onCoordinatesChange) {
                onCoordinatesChange({ latitude: 55.1694, longitude: 23.8813 });
            }
        }
    }, [coordinates]);

    // Update search value when address prop changes
    useEffect(() => {
        if (address !== searchValue) {
            setSearchValue(address);
        }
    }, [address]);

    const mapCenter = selectedPosition || [55.1694, 23.8813];

    return (
        <div className="space-y-4">
            {/* Address Input */}
            <div>
                <Label htmlFor="address-input" className="text-sm font-medium">
                    Event Address *
                </Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        id="address-input"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter event address"
                        className="flex-1"
                        required
                    />
                    <Button
                        type="button"
                        onClick={handleLocationSearchClick}
                        disabled={!searchValue.trim() || isSearching || searchValue.length < 3}
                        className="px-3"
                    >
                        {isSearching ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Type an address and click search, or click on the map below
                </p>
            </div>

            {/* Location Name Display */}
            {locationInput && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{locationInput}</span>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <RecenterMap position={selectedPosition} />
                    <LocationMarker />
                </MapContainer>
            </div>

            {/* Current Coordinates Display */}
            {coordinates?.latitude && coordinates?.longitude && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                            Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                        </span>
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Click on the map to select a location. The address will be automatically updated.
            </p>
        </div>
    );
}
