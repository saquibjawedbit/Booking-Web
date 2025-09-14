import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Hotel,
  Loader2,
  MapPin,
  Package,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getCurrentUserHotelBookings,
  getCurrentUserItemBookings,
  getCurrentUserSessionBookings,
} from '../../Api/booking.api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import UserLayout from './UserLayout';

const UserBookings = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [bookings, setBookings] = useState({
    sessions: [],
    hotels: [],
    items: [],
  });
  const [loading, setLoading] = useState({
    sessions: true,
    hotels: false,
    items: false,
  });
  const [error, setError] = useState({
    sessions: null,
    hotels: null,
    items: null,
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    sessions: { page: 1, limit: 6, total: 0, totalPages: 0 },
    hotels: { page: 1, limit: 6, total: 0, totalPages: 0 },
    items: { page: 1, limit: 6, total: 0, totalPages: 0 },
  });

  const fetchBookings = async (type = 'sessions', page = 1) => {
    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      setError((prev) => ({ ...prev, [type]: null }));

      let response;
      const queryParams = {
        page,
        limit: pagination[type].limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      switch (type) {
        case 'sessions':
          response = await getCurrentUserSessionBookings(queryParams);
          break;
        case 'hotels':
          response = await getCurrentUserHotelBookings(queryParams);
          break;
        case 'items':
          response = await getCurrentUserItemBookings(queryParams);
          break;
        default:
          throw new Error('Invalid booking type');
      }

      const responseData = response.data.data || response.data;
      setBookings((prev) => ({
        ...prev,
        [type]: responseData.bookings || [],
      }));
      setPagination((prev) => ({
        ...prev,
        [type]: {
          page: responseData.page || 1,
          limit: prev[type].limit,
          total: responseData.total || 0,
          totalPages: responseData.totalPages || 0,
        },
      }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        [type]: `Failed to fetch ${type} bookings`,
      }));
      console.error(`Error fetching ${type} bookings:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    fetchBookings('sessions');
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (!bookings[value].length && !loading[value]) {
      fetchBookings(value);
    }
  };

  const getStatusBadgeClass = (date) => {
    if (date && new Date(date) > new Date()) {
      return 'bg-red-500 text-white';
    }
    return 'bg-green-500 text-white';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time TBD';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Time';
    }
  };

  const handlePageChange = (newPage) => {
    const currentPagination = pagination[activeTab];
    if (newPage >= 1 && newPage <= currentPagination.totalPages) {
      fetchBookings(activeTab, newPage);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };
  const BookingDetailsDialog = () => {
    if (!selectedBooking) return null;

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedBooking.session?.adventureId?.name ||
                'Adventure Session'}
            </DialogTitle>
            <DialogDescription>
              Booking ID: {selectedBooking._id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Adventure Image */}
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img
                src={
                  selectedBooking.session?.adventureId?.medias[0] ||
                  selectedBooking.session?.adventureId?.thumbnail ||
                  '/placeholder.svg?height=200&width=400'
                }
                alt={selectedBooking.session?.adventureId?.name || 'Adventure'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.svg?height=200&width=400';
                }}
              />
              <Badge
                className={`absolute top-4 right-4 ${getStatusBadgeClass(selectedBooking.status)}`}
              >
                {selectedBooking.status?.charAt(0).toUpperCase() +
                  selectedBooking.status?.slice(1) || 'Pending'}
              </Badge>
            </div>

            {/* Adventure Description */}
            {selectedBooking.session?.adventureId?.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  About this Adventure
                </h3>
                <p className="text-gray-600">
                  {selectedBooking.session.adventureId.description}
                </p>
              </div>
            )}

            {/* Session Details */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Session Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedBooking.session?.startTime)} at{' '}
                      {formatTime(selectedBooking.session?.startTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.session?.location?.name}
                    </p>
                    {selectedBooking.session?.location?.address && (
                      <p className="text-xs text-gray-500">
                        {selectedBooking.session.location.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Instructor</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.session?.instructorId?.name || 'TBD'}
                    </p>
                    {selectedBooking.session?.instructorId?.email && (
                      <p className="text-xs text-gray-500">
                        {selectedBooking.session.instructorId.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.session?.capacity || 'N/A'} people max
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Day</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.session?.days || 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Price Type</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.session?.priceType || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">
                Booking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Booking Date</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedBooking.bookingDate)} at{' '}
                    {formatTime(selectedBooking.bookingDate)}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Amount Paid</p>
                  <p className="text-sm font-semibold text-green-600">
                    ${selectedBooking.amount}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedBooking.modeOfPayment}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Transaction ID</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {selectedBooking.transactionId}
                  </p>
                </div>

                {selectedBooking.groupMember?.length > 0 && (
                  <div>
                    <p className="font-medium">Group Size</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.groupMember.length + 1} people
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* User Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.user?.name}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedBooking.session?.notes && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Session Notes
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedBooking.session.notes}
                </p>
              </div>
            )}

            {/* Rating if available */}
            {selectedBooking.rating && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Rating</h3>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {selectedBooking.rating}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  const renderSessionBooking = (booking) => (
    <Card
      key={booking._id}
      className="overflow-hidden rounded-2xl border-gray-200"
    >
      <div className="relative h-40">
        <img
          src={
            booking.session?.adventureId?.medias[0] ||
            '/placeholder.svg?height=200&width=300'
          }
          alt={booking.session?.adventureId?.name || 'Adventure'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder.svg?height=200&width=300';
          }}
        />
        <Badge
          className={`absolute top-2 right-2 rounded-full ${getStatusBadgeClass(booking.startTime)}`}
        >
          {new Date(booking.startTime) > new Date() ? 'Upcoming' : 'Completed'}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle>
          {booking.session?.adventureId?.name || 'Adventure Session'}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {booking.session?.location?.name ||
            booking.session?.location?.address ||
            'Location TBD'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <div className="flex flex-col">
              <span>{formatDate(booking.session?.startTime)}</span>
              <span className="text-xs text-gray-500">
                {formatTime(booking.session?.startTime)}
              </span>
            </div>
          </div>
          <div className="font-medium">
            ${booking.amount || booking.session?.price || 0}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="text-sm">
              {booking.session?.instructorId?.fullName ||
                booking.session?.instructorId?.name ||
                'Instructor TBD'}
            </span>
          </div>
          {booking.rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-black text-black" />
              <span className="text-xs ml-1">{booking.rating}</span>
            </div>
          )}
        </div>
        {booking.groupMember?.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Group size: {booking.groupMember.length + 1}
          </div>
        )}
      </CardContent>
      <div className="px-6 pb-4">
        <Button
          variant="outline"
          className="w-full rounded-xl border-gray-300 hover:bg-gray-50"
          onClick={() => handleViewDetails(booking)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );

  const renderHotelBooking = (booking) => (
    <Card
      key={booking._id}
      className="overflow-hidden rounded-2xl border-gray-200"
    >
      <div className="relative h-40">
        <img
          src={booking.hotel?.medias?.[0]}
          alt={booking.hotel?.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-4 w-4" />
          {booking.hotel?.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {booking.hotel?.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <div className="flex flex-col">
              <span>{formatDate(booking.hotel?.startDate)}</span>
              <span className="text-xs text-gray-500">
                to {formatDate(booking.hotel?.endDate)}
              </span>
            </div>
          </div>
          <div className="font-medium">${booking.amount}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="text-sm">
              {booking.hotel?.quantity} room
              {booking.hotel?.quantity > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4">
        <Button
          variant="outline"
          className="w-full rounded-xl border-gray-300 hover:bg-gray-50"
          onClick={() => handleViewDetails(booking)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );

  const renderItemBooking = (booking) => (
    console.log(booking),
    (
      <Card
        key={booking._id}
        className="overflow-hidden rounded-2xl border-gray-200"
      >
        <div className="relative h-40">
          <img
            src={booking.items?.[0]?.item?.images?.[0]}
            alt={booking.items?.[0]?.item?.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.svg?height=200&width=300';
            }}
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {booking.items?.[0]?.item?.name || 'Item Booking'}
          </CardTitle>
          <CardDescription>
            {booking.items?.length || 0} item
            {(booking.items?.length || 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between text-sm mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <div className="flex flex-col">
                <span>{formatDate(booking.createdAt)}</span>
                <span className="text-xs text-gray-500">Booked on</span>
              </div>
            </div>
            <div className="font-medium">${booking.amount || 0}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span className="text-sm capitalize">
                {booking.modeOfPayment || 'Payment'}
              </span>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <Button
            variant="outline"
            className="w-full rounded-xl border-gray-300 hover:bg-gray-50"
            onClick={() => handleViewDetails(booking)}
          >
            View Details
          </Button>
        </div>
      </Card>
    )
  );

  const renderBookingsList = (type) => {
    const currentBookings = bookings[type];
    const currentLoading = loading[type];
    const currentError = error[type];
    const currentPagination = pagination[type];

    if (currentLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your {type} bookings...</span>
        </div>
      );
    }

    if (currentError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{currentError}</p>
          <Button
            onClick={() => fetchBookings(type, currentPagination.page)}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (!currentBookings.length) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No {type} bookings found</p>
          <p className="text-gray-400">
            Book your first{' '}
            {type === 'sessions' ? 'adventure' : type.slice(0, -1)} to see it
            here!
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBookings.map((booking) => {
            switch (type) {
              case 'sessions':
                return renderSessionBooking(booking);
              case 'hotels':
                return renderHotelBooking(booking);
              case 'items':
                return renderItemBooking(booking);
              default:
                return null;
            }
          })}
        </div>

        {/* Pagination */}
        {currentPagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => handlePageChange(currentPagination.page - 1)}
                disabled={currentPagination.page <= 1}
                variant="outline"
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(currentPagination.page + 1)}
                disabled={
                  currentPagination.page >= currentPagination.totalPages
                }
                variant="outline"
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPagination.page - 1) * currentPagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      currentPagination.page * currentPagination.limit,
                      currentPagination.total
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{currentPagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <Button
                    onClick={() => handlePageChange(currentPagination.page - 1)}
                    disabled={currentPagination.page <= 1}
                    variant="outline"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  {[...Array(currentPagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPagination.page;

                    return (
                      <Button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        variant={isCurrentPage ? 'default' : 'outline'}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          isCurrentPage
                            ? 'z-10 bg-black text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  <Button
                    onClick={() => handlePageChange(currentPagination.page + 1)}
                    disabled={
                      currentPagination.page >= currentPagination.totalPages
                    }
                    variant="outline"
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          {renderBookingsList('sessions')}
        </TabsContent>

        <TabsContent value="hotels">{renderBookingsList('hotels')}</TabsContent>

        <TabsContent value="items">{renderBookingsList('items')}</TabsContent>
      </Tabs>
      {/* Booking Details Dialog */}
      <BookingDetailsDialog />{' '}
    </div>
  );
};

export default function UserBookingsPage() {
  return (
    <UserLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">My Bookings</h1>
              <p className="text-gray-600">Manage your adventure bookings</p>
            </div>
          </div>

          {/* Content */}
          <UserBookings />
        </div>
      </div>
    </UserLayout>
  );
}
