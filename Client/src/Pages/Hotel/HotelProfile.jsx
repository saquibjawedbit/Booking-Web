import {
  Award,
  DollarSign,
  Edit,
  FileText,
  Home,
  MapPin,
  Phone,
  PocketIcon as Pool,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotelByOwnerId } from '../../Api/hotel.api.js';
import { HotelUpdateModal } from '../../components/HotelUpdateModal';
import { Loader } from '../../components/Loader';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { useAuth } from '../AuthProvider';

export const HotelProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateType, setUpdateType] = useState('price');
  const Navigate = useNavigate();
  const fetchHotel = async () => {
    setLoading(true);
    try {
      const res = await getHotelByOwnerId(user.user._id);
      if (res.data.data.hotel[0].verified === 'pending') {
        Navigate('/hotel/pending');
      }
      if (res.data && res.data.data.hotel && res.data.data.hotel.length > 0) {
        setHotel(res.data.data.hotel[0]);
        if (
          res.data.data.hotel[0].medias &&
          res.data.data.hotel[0].medias.length > 0
        ) {
          setActiveImage(res.data.data.hotel[0].medias[0]);
        } else if (res.data.data.hotel[0].logo) {
          setActiveImage(res.data.data.hotel[0].logo);
        }
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedHotel) => {
    setHotel(updatedHotel);
  };

  const openUpdateModal = (type) => {
    setUpdateType(type);
    setUpdateModalOpen(true);
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Hotel Found</h2>
              <p className="text-muted-foreground mb-6">
                You don't have any hotel registered yet.
              </p>
              <Button>Register Hotel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Main info */}
          <div className="w-full md:w-2/3">
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  {hotel.logo && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border">
                      <img
                        src={hotel.logo || '/placeholder.svg'}
                        alt={`${hotel?.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg?height=64&width=64';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl">{hotel?.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <CardDescription>{hotel.location}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Hotel Details</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Manager: {hotel.managerName}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>Contact: {hotel.contactNo}</span>
                      </li>{' '}
                      <li className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>Rooms: {hotel.noRoom}</span>
                      </li>{' '}
                      <li className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Base Price: ${hotel.price}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateModal('price')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Price per Night: ${hotel.pricePerNight || hotel.price}
                        </span>
                      </li>
                      <li className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>Rating: {hotel.rating || 0}/5</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateModal('rating')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span>Address: {hotel.fullAddress}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities &&
                        hotel.amenities.map((amenity, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            {amenity === 'Pool' && <Pool className="h-3 w-3" />}
                            {amenity}
                          </Badge>
                        ))}
                    </div>

                    <h3 className="font-medium mt-6 mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {hotel.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gallery Section */}
            {hotel.medias && hotel.medias.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md overflow-hidden mb-4 bg-muted">
                    <img
                      src={activeImage || '/placeholder.svg'}
                      alt="Hotel view"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg?height=400&width=600';
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {hotel.medias.map((media, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${activeImage === media ? 'border-primary' : 'border-transparent'}`}
                        onClick={() => setActiveImage(media)}
                      >
                        <img
                          src={media || '/placeholder.svg'}
                          alt={`Hotel view ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              '/placeholder.svg?height=80&width=80';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Documents & Certificates */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Documents & Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="license">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="license">License</TabsTrigger>
                    <TabsTrigger value="certificate">Certificate</TabsTrigger>
                    <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="license" className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden">
                      <img
                        src={hotel.license || '/placeholder.svg'}
                        alt="Hotel license"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            '/placeholder.svg?height=400&width=300';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Hotel License</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(hotel.license, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="certificate" className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden">
                      <img
                        src={hotel.certificate || '/placeholder.svg'}
                        alt="Hotel certificate"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            '/placeholder.svg?height=400&width=300';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Hotel Certificate</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(hotel.certificate, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="insurance" className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden">
                      <img
                        src={hotel.insurance || '/placeholder.svg'}
                        alt="Hotel insurance"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            '/placeholder.svg?height=400&width=300';
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Insurance Document</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(hotel.insurance, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>{' '}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <HotelUpdateModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        hotel={hotel}
        onSuccess={handleUpdateSuccess}
        updateType={updateType}
      />
    </div>
  );
};
