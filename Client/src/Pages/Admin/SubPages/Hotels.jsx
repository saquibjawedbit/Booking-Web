import { motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Download,
  Eye,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { approve, reject } from '../../../Api/hotel.api';
import { fetchLocations } from '../../../Api/location.api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { useHotels } from '../../../hooks/useHotel';

export default function HotelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState([]);
  const limit = 10;
  const { hotels, isLoading, totalPages } = useHotels({
    search: searchTerm,
    page,
    limit,
    status: statusFilter,
    location: locationFilter || null,
    minPrice: minPrice || null,
    maxPrice: maxPrice || null,
    minRating: minRating || null,
    sortBy,
    sortOrder,
  });

  // Fetch locations on component mount
  useEffect(() => {
    const getLocations = async () => {
      try {
        const res = await fetchLocations();
        setLocations(res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    getLocations();
  }, []);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showHotelDetails, setShowHotelDetails] = useState(false);

  const viewHotelDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowHotelDetails(true);
  };

  const approveHotel = async (hotel) => {
    // Here you would typically send an API request to approve the hotel
    const res = await approve(hotel._id);
    if (res.status === 200) {
      toast.success(`${hotel?.name} has been approved`);
    }
    setShowHotelDetails(false);
  };

  const declineHotel = async (hotel) => {
    // Here you would typically send an API request to decline the hotel
    const res = await reject(hotel._id);
    if (res.status === 200) {
      toast.success(`${hotel?.name} has been declined`);
    }
    setShowHotelDetails(false);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search hotels..."
                className="w-[200px] sm:w-[300px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Hotels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending Approval
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                  Approved Hotels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                  Rejected Hotels
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>{' '}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>{' '}
        {/* Enhanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {locationFilter
                    ? locations.find((loc) => loc._id === locationFilter)
                        ?.name || 'Select location'
                    : 'All Locations'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => setLocationFilter('')}>
                  All Locations
                </DropdownMenuItem>
                {locations.map((location) => (
                  <DropdownMenuItem
                    key={location._id}
                    onClick={() => setLocationFilter(location._id)}
                  >
                    {location?.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Price</label>
            <Input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Price</label>
            <Input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Rating</label>
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Min rating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {sortBy === 'createdAt' && 'Date Created'}
                  {sortBy === 'pricePerNight' && 'Price per Night'}
                  {sortBy === 'rating' && 'Rating'}
                  {sortBy === 'name' && 'Name'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                  Date Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('pricePerNight')}>
                  Price per Night
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('rating')}>
                  Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  {' '}
                  <TableRow>
                    <TableHead>Hotel Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Price/Night</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {' '}
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7}>Loading...</TableCell>
                    </TableRow>
                  ) : hotels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>No hotels found.</TableCell>
                    </TableRow>
                  ) : (
                    hotels.map((hotel) => (
                      <TableRow key={hotel._id}>
                        <TableCell className="font-medium">
                          {hotel?.name}
                        </TableCell>
                        <TableCell>{hotel.location?.name}</TableCell>
                        <TableCell>
                          {(hotel.managerName && hotel.managerName) || '-'}
                        </TableCell>
                        <TableCell>
                          ${hotel.pricePerNight || hotel.price || 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span>{hotel.rating || 0}/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(hotel.verified)}
                            className="capitalize"
                          >
                            {hotel.verified}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewHotelDetails(hotel)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center">Loading...</div>
            ) : hotels.length === 0 ? (
              <div className="col-span-full text-center">No hotels found.</div>
            ) : (
              hotels.map((hotel) => (
                <Card key={hotel._id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={hotel.logo || '/placeholder.svg'}
                      alt={hotel?.name}
                      className="object-cover w-full h-full"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={getStatusBadgeVariant(hotel.verified)}
                    >
                      {hotel.verified?.charAt(0).toUpperCase() +
                        hotel.verified?.slice(1)}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{hotel?.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> {hotel.location?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{hotel.rating || '-'} Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{hotel.noRoom || '-'} Rooms</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hotel.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewHotelDetails(hotel)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          {/* Pagination Controls for grid view */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showHotelDetails} onOpenChange={setShowHotelDetails}>
        {selectedHotel && (
          <DialogContent className="sm:max-w-[700px] max-h-[90vh]  overflow-y-auto">
            <DialogHeader className="py-4">
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{selectedHotel?.name}</span>
                <Badge
                  variant={getStatusBadgeVariant(selectedHotel.verified)}
                  className="capitalize ml-2"
                >
                  {selectedHotel.verified}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Submitted on {formatDate(selectedHotel.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {/* Tabs for Info and Gallery */}
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="grid gap-6 py-4">
                  {/* Hotel Logo */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedHotel.logo || '/placeholder.svg'}
                      alt={selectedHotel?.name}
                      className="object-cover w-40 h-40 rounded-md border"
                    />
                  </div>
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Location
                        </p>
                        <p>{selectedHotel.location?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Manager
                        </p>
                        <p>
                          {(selectedHotel.managerName &&
                            selectedHotel.managerName?.name) ||
                            '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Contact Email
                        </p>
                        <p>{selectedHotel.owner.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Contact Phone
                        </p>
                        <p>{selectedHotel.contactNo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Number of Rooms
                        </p>
                        <p>{selectedHotel.noRoom}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Full Address
                        </p>
                        <p>{selectedHotel.fullAddress}</p>
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-gray-700">{selectedHotel.description}</p>
                  </div>
                  {/* Amenities */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedHotel.amenities || []).map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Documents */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Submitted Documents
                    </h3>
                    <div className="space-y-2">
                      {selectedHotel.license && (
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <span>Business License</span>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={selectedHotel.license}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Document
                            </a>
                          </Button>
                        </div>
                      )}
                      {selectedHotel.insurance && (
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <span>Insurance Policy</span>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={selectedHotel.insurance}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Document
                            </a>
                          </Button>
                        </div>
                      )}
                      {selectedHotel.certificate && (
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <span>Certificate</span>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={selectedHotel.certificate}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Document
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="gallery">
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4"
                  style={{ minHeight: 400, maxHeight: 400, overflowY: 'auto' }}
                >
                  {(selectedHotel.medias || []).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-md overflow-hidden"
                    >
                      <img
                        src={image || '/placeholder.svg'}
                        alt={`${selectedHotel?.name} - ${index + 1}`}
                        className="w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            {/* Action Buttons */}
            <DialogFooter className="flex justify-between sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHotelDetails(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => declineHotel(selectedHotel)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => approveHotel(selectedHotel)}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
}
