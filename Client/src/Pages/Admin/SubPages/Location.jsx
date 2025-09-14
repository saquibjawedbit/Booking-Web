import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import {
  createLocation,
  deleteLocation,
  fetchLocations,
  updateLocation,
} from '../../../Api/location.api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';

// Fix default marker icon issue in leaflet
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

// Focuses the map on the new position when it changes
function FocusMapOnPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, map]);
  return null;
}

function fetchAddressFromCoords(lat, lng, setAddress) {
  fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  )
    .then((res) => res.json())
    .then((data) => setAddress(data.display_name || 'Unknown address'))
    .catch(() => setAddress('Unknown address'));
}

function fetchCoordsFromAddress(address, setPosition, setAddress, setError) {
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data && data[0]) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setAddress(data[0].display_name);
        setError('');
      } else {
        setError('Address not found');
      }
    })
    .catch(() => setError('Error fetching coordinates'));
}

function LocationFormModal({ open, onClose, onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [position, setPosition] = useState(initialData?.position || null);
  const [address, setAddress] = useState(initialData?.address || '');
  const [addressInput, setAddressInput] = useState('');
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if (position) {
      fetchAddressFromCoords(position[0], position[1], setAddress);
    } else {
      setAddress('');
    }
  }, [position]);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData?.name || '');
      setDescription(initialData.description || '');
      setPosition(initialData.position || null);
      setAddress(initialData.address || '');
      setAddressInput('');
      setGeoError('');
    } else if (open && !initialData) {
      setName('');
      setDescription('');
      setPosition(null);
      setAddress('');
      setAddressInput('');
      setGeoError('');
    }
  }, [open, initialData]);

  const handleAddressSearch = (e) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    fetchCoordsFromAddress(addressInput, setPosition, setAddress, setGeoError);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !position) return;
    onSubmit({
      name,
      description,
      position,
      address,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          {initialData ? 'Edit Location' : 'Add Location'}
        </DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
          <Input
            placeholder="Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <div className="mb-2 font-medium">
              Pick location on map or search by address:
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Search address..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleAddressSearch}
                variant="outline"
              >
                Find
              </Button>
            </div>
            {geoError && (
              <div className="text-xs text-red-500 mb-2">{geoError}</div>
            )}
            <MapContainer
              center={position || [27.7, 85.3]}
              zoom={position ? 14 : 6}
              style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <FocusMapOnPosition position={position} />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
            {position && (
              <div className="mt-2 text-sm text-muted-foreground">
                <div>
                  Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
                </div>
                <div className="truncate">
                  Address: {address || 'Loading...'}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!position}>
              {initialData ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLocations()
      .then((res) => {
        // API returns { statusCode, data, message }
        setLocations(
          (res.data || []).map((loc) => ({
            id: loc._id,
            name: loc?.name,
            description: loc.description,
            lat: loc.location?.coordinates[1],
            lng: loc.location?.coordinates[0],
            address: loc.address,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddClick = () => {
    setEditIndex(null);
    setModalOpen(true);
  };

  const handleEditClick = (idx) => {
    setEditIndex(idx);
    setModalOpen(true);
  };

  const handleDelete = async (idx) => {
    const loc = locations[idx];
    if (!loc) return;
    setLoading(true);
    try {
      await deleteLocation(loc.id);
      setLocations((prev) => prev.filter((_, i) => i !== idx));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = async (data) => {
    setLoading(true);
    try {
      if (editIndex === null) {
        // Create
        const res = await createLocation(data);
        const loc = res.data;
        setLocations((prev) => [
          ...prev,
          {
            id: loc._id,
            name: loc?.name,
            description: loc.description,
            lat: loc.location?.coordinates[1],
            lng: loc.location?.coordinates[0],
            address: loc.address,
          },
        ]);
      } else {
        // Update
        const loc = locations[editIndex];
        const res = await updateLocation(loc.id, data);
        const updated = res.data;
        setLocations((prev) =>
          prev.map((l, i) =>
            i === editIndex
              ? {
                  id: updated._id,
                  name: updated?.name,
                  description: updated.description,
                  lat: updated.location?.coordinates[1],
                  lng: updated.location?.coordinates[0],
                  address: updated.address,
                }
              : l
          )
        );
      }
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Locations</h2>
        <Button onClick={handleAddClick}>Add Location</Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Existing Locations</h3>
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <ul className="space-y-2">
                {locations.length === 0 && (
                  <li className="text-muted-foreground">No locations yet.</li>
                )}
                {locations.map((loc, idx) => (
                  <li
                    key={loc.id}
                    className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div>
                      <div className="font-medium">{loc?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {loc.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lat: {loc.lat.toFixed(5)}, Lng: {loc.lng.toFixed(5)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {loc.address}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(idx)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(idx)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
      <LocationFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={
          editIndex !== null
            ? {
                name: locations[editIndex]?.name,
                description: locations[editIndex]?.description,
                position: locations[editIndex]
                  ? [locations[editIndex].lat, locations[editIndex].lng]
                  : null,
                address: locations[editIndex]?.address,
              }
            : undefined
        }
      />
    </div>
  );
}
