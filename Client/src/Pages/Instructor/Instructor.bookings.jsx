import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fadeIn, staggerContainer } from '../../assets/Animations';
import { axiosClient } from '../../AxiosClient/axios.js';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { useAuth } from '../AuthProvider';
import InstructorLayout from './InstructorLayout';

export const InstructorBookings = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState({
    upcoming: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (user?.user?._id) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bookings where the current user is an instructor
      const [eventBookingsRes, sessionBookingsRes] = await Promise.allSettled([
        // Event bookings where user is assigned as instructor
        axiosClient.get(`/api/event-bookings?instructor=${user.user._id}`),
        // Session bookings where user is the session instructor
        axiosClient.get(`/api/sessionBooking?instructor=${user.user._id}`),
      ]);

      let allBookings = [];

      // Process event bookings
      if (
        eventBookingsRes.status === 'fulfilled' &&
        eventBookingsRes.value?.data?.success
      ) {
        const eventBookings = eventBookingsRes.value.data.data || [];
        const processedEventBookings = eventBookings.map((booking) => ({
          id: booking._id,
          type: 'event',
          adventure: booking.event?.title || 'Event Booking',
          location: booking.event?.location || 'Location TBD',
          date: booking.event?.date
            ? new Date(booking.event.date).toISOString().split('T')[0]
            : null,
          time: booking.event?.startTime || 'TBD',
          endTime: booking.event?.endTime,
          duration: calculateDuration(
            booking.event?.startTime,
            booking.event?.endTime
          ),
          participants: booking.participants || 1,
          amount: booking.amount || 0,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          bookingDate: booking.bookingDate,
          rating: booking.rating || null,
          customerName: booking.user?.name || 'Guest',
          customerEmail: booking.contactInfo?.email || booking.user?.email,
          customerPhone: booking.contactInfo?.phone,
          adventures: booking.adventureInstructors || [],
          nftEligible: booking.nftEligible,
          completionStatus: booking.adventureCompletionStatus || [],
        }));
        allBookings.push(...processedEventBookings);
      }

      // Process session bookings
      if (
        sessionBookingsRes.status === 'fulfilled' &&
        sessionBookingsRes.value?.data?.success
      ) {
        const sessionBookings = sessionBookingsRes.value.data.data || [];
        const processedSessionBookings = sessionBookings.map((booking) => ({
          id: booking._id,
          type: 'session',
          adventure: booking.session?.title || 'Session Booking',
          location: booking.session?.location || 'Location TBD',
          date: booking.session?.date
            ? new Date(booking.session.date).toISOString().split('T')[0]
            : null,
          time: booking.session?.startTime || 'TBD',
          endTime: booking.session?.endTime,
          duration: calculateDuration(
            booking.session?.startTime,
            booking.session?.endTime
          ),
          participants: booking.participants || 1,
          amount: booking.amount || 0,
          status: booking.status,
          paymentStatus: booking.paymentStatus || 'pending',
          bookingDate: booking.bookingDate,
          rating: booking.rating || null,
          customerName: booking.user?.name || 'Guest',
          customerEmail: booking.user?.email,
          groupMembers: booking.groupMember || [],
        }));
        allBookings.push(...processedSessionBookings);
      }

      // Separate upcoming and completed bookings
      const now = new Date();
      const upcoming = allBookings
        .filter((booking) => {
          if (!booking.date) return booking.status !== 'completed';
          const bookingDate = new Date(booking.date);
          return bookingDate >= now && booking.status !== 'completed';
        })
        .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

      const completed = allBookings
        .filter((booking) => {
          if (!booking.date) return booking.status === 'completed';
          const bookingDate = new Date(booking.date);
          return bookingDate < now || booking.status === 'completed';
        })
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      setBookings({ upcoming, completed });
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings. Please try again.');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Duration TBD';

    try {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const durationMinutes = endMinutes - startMinutes;

      if (durationMinutes <= 0) return 'Duration TBD';

      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      if (hours === 0) return `${minutes} minutes`;
      if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      return `${hours}h ${minutes}m`;
    } catch {
      return 'Duration TBD';
    }
  };

  const getStatusVariant = (status, paymentStatus) => {
    if (status === 'completed') return 'default';
    if (status === 'confirmed' && paymentStatus === 'completed')
      return 'default';
    if (status === 'confirmed') return 'secondary';
    if (status === 'cancelled') return 'destructive';
    return 'outline';
  };

  const getStatusText = (status, paymentStatus) => {
    if (status === 'completed') return t('instructor.completed') || 'Completed';
    if (status === 'confirmed' && paymentStatus === 'completed')
      return t('instructor.confirmed') || 'Confirmed';
    if (status === 'confirmed')
      return t('instructor.confirmedPending') || 'Confirmed (Payment Pending)';
    if (status === 'cancelled') return t('instructor.cancelled') || 'Cancelled';
    return t('instructor.pending') || 'Pending';
  };

  const filteredBookings = (bookingsList) => {
    return bookingsList.filter((booking) => {
      const matchesSearch =
        !searchTerm ||
        booking.adventure.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'upcoming' &&
          new Date(booking.date || 0) >= new Date()) ||
        (statusFilter === 'completed' && booking.status === 'completed') ||
        (statusFilter === 'pending' && booking.status === 'pending') ||
        (statusFilter === 'confirmed' && booking.status === 'confirmed');

      return matchesSearch && matchesStatus;
    });
  };

  return (
    <InstructorLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {t('instructor.bookings')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('instructor.manageYourBookings')}
            </p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('instructor.searchBookings')}
                className="w-full pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={loadBookings}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 sm:mr-0 animate-spin" />
              ) : (
                <Filter className="h-4 w-4 mr-1 sm:mr-0" />
              )}
              <span className="sm:hidden">
                {loading ? t('instructor.loading') : t('instructor.refresh')}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-end sm:space-y-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('instructor.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('instructor.allBookings')}</SelectItem>
              <SelectItem value="upcoming">
                {t('instructor.upcomingOnly')}
              </SelectItem>
              <SelectItem value="completed">
                {t('instructor.completedOnly')}
              </SelectItem>
              <SelectItem value="pending">
                {t('instructor.pendingOnly')}
              </SelectItem>
              <SelectItem value="confirmed">
                {t('instructor.confirmedOnly')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
            <TabsTrigger value="upcoming" className="text-sm sm:text-base">
              {t('instructor.upcoming')} (
              {filteredBookings(bookings.upcoming).length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm sm:text-base">
              {t('instructor.completed')} (
              {filteredBookings(bookings.completed).length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                {t('instructor.loadingBookings')}
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-muted-foreground">{error}</p>
              <Button onClick={loadBookings} variant="outline">
                {t('instructor.tryAgain')}
              </Button>
            </div>
          ) : null}

          <TabsContent value="upcoming" className="space-y-4">
            {!loading && !error && (
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredBookings(bookings.upcoming).length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? t('instructor.noMatchingBookings')
                        : t('instructor.noUpcomingBookings')}
                    </p>
                  </div>
                ) : (
                  filteredBookings(bookings.upcoming).map((booking) => (
                    <motion.div key={booking.id} variants={fadeIn}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
                              <div className="bg-primary/10 p-2 sm:p-3 rounded-full w-fit flex-shrink-0">
                                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <h3 className="font-semibold text-base sm:text-lg truncate">
                                  {booking.adventure}
                                </h3>
                                <div className="flex flex-col space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                                    <div className="flex items-center">
                                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">
                                        {booking.location}
                                      </span>
                                    </div>
                                    <div className="hidden sm:block mx-3">
                                      •
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="whitespace-nowrap">
                                        {booking.date
                                          ? new Date(
                                              booking.date
                                            ).toLocaleDateString()
                                          : 'Date TBD'}{' '}
                                        {booking.time}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {booking.duration}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Customer: {booking.customerName}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                <span className="text-xs sm:text-sm">
                                  {booking.participants}{' '}
                                  {t('instructor.participants')}
                                </span>
                              </div>
                              <div className="font-semibold text-lg">
                                ${booking.amount}
                              </div>
                              <Badge
                                variant={getStatusVariant(
                                  booking.status,
                                  booking.paymentStatus
                                )}
                                className="text-xs"
                              >
                                {getStatusText(
                                  booking.status,
                                  booking.paymentStatus
                                )}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2 mt-4 pt-3 border-t border-gray-100">
                            {booking.customerEmail && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto text-xs sm:text-sm"
                                onClick={() =>
                                  window.open(
                                    `mailto:${booking.customerEmail}`,
                                    '_blank'
                                  )
                                }
                              >
                                {t('instructor.contactCustomer')}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                              {t('instructor.viewDetails')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {!loading && !error && (
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredBookings(bookings.completed).length === 0 ? (
                  <div className="text-center py-12">
                    <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? t('instructor.noMatchingBookings')
                        : t('instructor.noCompletedBookings')}
                    </p>
                  </div>
                ) : (
                  filteredBookings(bookings.completed).map((booking) => (
                    <motion.div key={booking.id} variants={fadeIn}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
                              <div className="bg-green-100 p-2 sm:p-3 rounded-full w-fit flex-shrink-0">
                                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <h3 className="font-semibold text-base sm:text-lg truncate">
                                  {booking.adventure}
                                </h3>
                                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {booking.location}
                                    </span>
                                  </div>
                                  <div className="hidden sm:block mx-3">•</div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="whitespace-nowrap">
                                      {booking.date
                                        ? new Date(
                                            booking.date
                                          ).toLocaleDateString()
                                        : 'Date TBD'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Customer: {booking.customerName}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                <span className="text-xs sm:text-sm">
                                  {booking.participants}{' '}
                                  {t('instructor.participants')}
                                </span>
                              </div>
                              <div className="font-semibold text-lg">
                                ${booking.amount}
                              </div>
                              {booking.rating && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                                  <span className="ml-1 text-sm">
                                    {booking.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2 mt-4 pt-3 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                              {t('instructor.viewDetails')}
                            </Button>
                            {booking.customerEmail && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto text-xs sm:text-sm"
                                onClick={() =>
                                  window.open(
                                    `mailto:${booking.customerEmail}`,
                                    '_blank'
                                  )
                                }
                              >
                                {t('instructor.contactCustomer')}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </InstructorLayout>
  );
};
export default InstructorBookings;
