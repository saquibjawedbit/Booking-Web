'use client';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Loader2,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAdventure } from '../../Api/adventure.api';
import { getInstructorBadge } from '../../Api/instructorAchievement.api';
import { getInstructorSessions } from '../../Api/session.api';
import { fadeIn, staggerContainer } from '../../assets/Animations';
import { axiosClient } from '../../AxiosClient/axios';
import SessionCalendar from '../../components/SessionCalendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import UpcomingBookingsCard from '../../components/UpcomingBookingsCard';
import { useAuth } from '../AuthProvider';
import InstructorLayout from './InstructorLayout';

const InstructorDashboard = () => {
  const [instructorBadge, setInstructorBadge] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('month');
  const [adventureTypes, setAdventureTypes] = useState([]);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    rating: 0,
    completedBookings: 0,
    bookingIncrease: 0,
    revenueIncrease: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.user?._id) return;

    setIsLoadingData(true);
    try {
      // Fetch instructor's bookings for statistics
      const [eventBookingsRes, sessionBookingsRes, payoutHistoryRes] =
        await Promise.allSettled([
          axiosClient.get(`/api/event-bookings?instructor=${user.user._id}`),
          axiosClient.get(`/api/sessionBooking?instructor=${user.user._id}`),
          axiosClient.get('/api/transactions/payout/history?limit=50'),
        ]);

      let allBookings = [];
      let totalRevenue = 0;

      // Process event bookings
      if (
        eventBookingsRes.status === 'fulfilled' &&
        eventBookingsRes.value?.data?.success
      ) {
        const eventBookings = eventBookingsRes.value.data.data || [];
        allBookings.push(...eventBookings);
        totalRevenue += eventBookings.reduce(
          (sum, booking) =>
            sum +
            (booking.status === 'completed' &&
            booking.paymentStatus === 'completed'
              ? booking.amount * 0.8
              : 0),
          0
        );
      }

      // Process session bookings
      if (
        sessionBookingsRes.status === 'fulfilled' &&
        sessionBookingsRes.value?.data?.success
      ) {
        const sessionBookings = sessionBookingsRes.value.data.data || [];
        allBookings.push(...sessionBookings);
        totalRevenue += sessionBookings.reduce(
          (sum, booking) =>
            sum + (booking.status === 'completed' ? booking.amount * 0.8 : 0),
          0
        );
      }

      // Add completed payout amounts
      if (
        payoutHistoryRes.status === 'fulfilled' &&
        payoutHistoryRes.value?.data?.success
      ) {
        const payouts = payoutHistoryRes.value.data.data.docs || [];
        const completedPayouts = payouts.filter((p) => p.status === 'SUCCESS');
        totalRevenue = completedPayouts.reduce(
          (sum, payout) => sum + payout.amount,
          0
        );
      }

      // Calculate statistics
      const completedBookings = allBookings.filter(
        (b) => b.status === 'completed'
      );
      const confirmedBookings = allBookings.filter(
        (b) => b.status === 'confirmed'
      );

      // Calculate upcoming bookings
      const now = new Date();
      const upcoming = allBookings
        .filter((booking) => {
          const bookingDate = new Date(
            booking.event?.date || booking.session?.date || booking.bookingDate
          );
          return (
            bookingDate >= now &&
            ['confirmed', 'pending'].includes(booking.status)
          );
        })
        .slice(0, 3);

      // Format upcoming bookings for display
      const formattedUpcoming = upcoming.map((booking) => ({
        id: booking._id,
        adventure:
          booking.event?.title || booking.session?.title || 'Adventure',
        location:
          booking.event?.location ||
          booking.session?.location ||
          'Location TBD',
        date:
          booking.event?.date || booking.session?.date || booking.bookingDate,
        time: booking.event?.startTime || booking.session?.startTime || 'TBD',
        duration: calculateDuration(
          booking.event?.startTime || booking.session?.startTime,
          booking.event?.endTime || booking.session?.endTime
        ),
        participants: booking.participants || 1,
        amount: booking.amount || 0,
        status: booking.status,
        customerName: booking.user?.name || 'Guest',
      }));

      // Calculate average rating
      const ratingsSum = completedBookings.reduce((sum, booking) => {
        return sum + (booking.rating || 0);
      }, 0);
      const averageRating =
        completedBookings.length > 0
          ? (ratingsSum / completedBookings.length).toFixed(1)
          : 0;

      // Calculate growth metrics (simplified - comparing with half of total)
      const recentBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate || booking.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return bookingDate >= oneMonthAgo;
      });

      const oldBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate || booking.createdAt);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return bookingDate >= twoMonthsAgo && bookingDate < oneMonthAgo;
      });

      const bookingIncrease =
        oldBookings.length > 0
          ? (
              ((recentBookings.length - oldBookings.length) /
                oldBookings.length) *
              100
            ).toFixed(1)
          : 0;

      setDashboardData({
        totalBookings: allBookings.length,
        totalRevenue: totalRevenue,
        rating: parseFloat(averageRating),
        completedBookings: completedBookings.length,
        bookingIncrease: parseFloat(bookingIncrease),
        revenueIncrease: 12.5, // This could be calculated similarly if historical revenue data is available
      });

      setUpcomingBookings(formattedUpcoming);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoadingData(false);
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

  const fetchUpcomingSessions = async () => {
    if (!user?.user?._id) return;

    setIsLoadingSessions(true);
    try {
      const res = await getInstructorSessions(user.user._id);
      if (res.status === 200 && res.data) {
        const sessions = res.data;
        const now = new Date();

        const upcomingCount = sessions.filter((session) => {
          const sessionStart = new Date(session.startTime);
          return sessionStart > now;
        }).length;

        setUpcomingSessionsCount(upcomingCount);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setUpcomingSessionsCount(0);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (!user.user) {
      toast.error('Please login to access the instructor dashboard');
      navigate('/login');
      return;
    }

    // Check if the user has instructor data and adventure ID
    if (user?.user?.instructor?.adventure) {
      getAdventure(user.user.instructor.adventure)
        .then((res) => {
          setAdventureTypes(res.data);
        })
        .catch((err) => {
          toast.error('Failed to load adventure data');
        });
    } else {
      toast.error('No adventure ID found for instructor');
    }

    // Fetch real dashboard data instead of just upcoming sessions
    fetchDashboardData();
    fetchUpcomingSessions();

    const fetchBadge = async () => {
      try {
        const res = await getInstructorBadge(user?.user?.instructor?._id);
        setInstructorBadge(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?.user?.instructor?._id) {
      fetchBadge(user.user.instructor._id);
    }
  }, [user, navigate]);

  const achievementData = [
    {
      title: 'Starter Badge',
      description: '“New Adventurer” – Complete first 5 bookings',
    },
    {
      title: 'Rising Star Badge',
      description: '“Rising Star” – 10 bookings completed',
    },
    {
      title: 'Trusted Pro Badge',
      description: '“Trusted Pro” – 50 successful bookings, 6+ months active',
    },
    {
      title: 'Elite Instructor Badge',
      description:
        '“Elite Instructor” – 150 successful bookings, 1+ year active',
    },
    {
      title: 'Full Send Legend Badge',
      description:
        '“Full Send Legend” – 250+ bookings, 2+ years active, contributed to community content or events',
    },
  ];
  const currentIndex = achievementData.findIndex(
    (ach) => ach.title === instructorBadge?.badge
  );
  return (
    <InstructorLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {t('instructor.dashboard')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t('instructor.welcomeMessage')}
            </p>
          </div>
        </div>

        <div defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div value="overview" className="space-y-4 sm:space-y-6">
            <motion.div
              className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                      {t('instructor.totalBookings')}
                    </CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {isLoadingData ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        dashboardData.totalBookings
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                      <span
                        className={`flex items-center ${dashboardData.bookingIncrease > 0 ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {dashboardData.bookingIncrease > 0 ? (
                          <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        ) : (
                          <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1 transform rotate-180" />
                        )}
                        {Math.abs(dashboardData.bookingIncrease)}%
                      </span>
                      <span className="hidden sm:inline">
                        {t('instructor.fromLast')} {timeRange}
                      </span>
                      <span className="sm:hidden">vs last {timeRange}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                      {t('instructor.upcomingSessions')}
                    </CardTitle>
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {isLoadingSessions ? '...' : upcomingSessionsCount}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                      <span className="text-blue-500">
                        {t('instructor.scheduled')}
                      </span>
                      <span>•</span>
                      <span className="hidden sm:inline">
                        {t('instructor.nextWeek')}
                      </span>
                      <span className="sm:hidden">next week</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                      {t('instructor.rating')}
                    </CardTitle>
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {isLoadingData ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        dashboardData.rating || '0.0'
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                      <span className="text-yellow-500 flex items-center">
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-current mr-0.5" />
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-current mr-0.5" />
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-current mr-0.5" />
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-current mr-0.5" />
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-current" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              <SessionCalendar adventureTypes={adventureTypes} />
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              <UpcomingBookingsCard
                bookings={upcomingBookings}
                onViewAll={() => navigate('/instructor/bookings')}
                isLoading={isLoadingData}
              />
            </motion.div>

            {/* Achievements Section */}
            <Separator />
            <h4 className="text-lg font-medium mb-4">{t('Achievements')}</h4>

            <div className="flex flex-col gap-4">
              {achievementData.map((ach, index) => {
                const unlocked = index <= currentIndex && currentIndex !== -1;

                return (
                  <div
                    key={ach.title}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-gray-100 transition-opacity duration-300 ${
                      unlocked ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <Award
                      className={`h-8 w-8 ${
                        unlocked ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <span className="text-sm font-medium">{ach.title}</span>
                      <p className="text-xs text-gray-600">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default InstructorDashboard;
