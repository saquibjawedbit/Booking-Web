'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
  Search,
  Star,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fadeIn, staggerContainer } from '../assets/Animations';
import { Footer } from '../components/Footer';
import { Nav_Landing } from '../components/Nav_Landing';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAdventures } from '../hooks/useAdventure';

import { useEvents } from '../hooks/useEvent';
import { useFriend } from '../hooks/useFriend.jsx';

// Lazy load heavy components
const ReactPlayer = lazy(() => import('react-player'));

const EventCard = memo(({ event, handleBooking, handleViewMore }) => (
  <motion.div
    key={event._id}
    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {/* Event Image */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={event.image || '/placeholder.svg?height=200&width=300'}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <h4 className="text-xl font-bold text-white">{event.title}</h4>
      </div>
    </div>

    {/* Event Details */}
    <div className="p-6 space-y-4">
      {/* Location Info */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-700">
          <MapPin className="h-5 w-5" />
          <span className="font-semibold">Location:</span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed pl-7">
          {event.city}, {event.country}
        </p>
        {event.location && (
          <p className="text-gray-500 text-xs leading-relaxed pl-7">
            {event.location}
          </p>
        )}
      </div>

      {/* Time Info */}
      <div className="flex items-center space-x-2 text-gray-600">
        <Clock className="h-5 w-5" />
        <span className="font-medium">
          Time: {event.startTime} - {event.endTime}
        </span>
      </div>

      {/* Date Info */}
      <div className="flex items-center space-x-2 text-gray-600">
        <Calendar className="h-5 w-5" />
        <span className="font-medium">
          Date: {new Date(event.date).toLocaleDateString()}
        </span>
      </div>

      {/* Adventures */}
      {event.adventures && event.adventures.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-700">
            <Compass className="h-5 w-5" />
            <span className="font-semibold">Adventures:</span>
          </div>
          <div className="pl-7 space-y-1">
            {event.adventures.slice(0, 2).map((adventure, index) => (
              <div
                key={adventure._id || index}
                className="flex items-center space-x-2"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">{adventure?.name}</span>
              </div>
            ))}
            {event.adventures.length > 2 && (
              <p className="text-gray-500 text-xs pl-4">
                +{event.adventures.length - 2} more adventure
                {event.adventures.length - 2 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-700">
          <Compass className="h-5 w-5" />
          <span className="font-semibold">Description:</span>
        </div>
        <p className="text-gray-600 leading-relaxed pl-7">
          {event.description && event.description.length > 20
            ? `${event.description.substring(0, 20)}...`
            : event.description}
        </p>
        {event.description && event.description.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (handleViewMore) handleViewMore(event);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium pl-7"
          >
            View More
          </button>
        )}
      </div>

      {/* Book Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => handleBooking(event)}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Users className="h-5 w-5 mr-2" />
          BOOK YOUR SPOT
        </Button>
      </motion.div>
    </div>
  </motion.div>
));

const SearchBar = memo(
  ({
    adventures,
    adventure,
    setadventure,
    location,
    setLocation,
    date,
    setDate,
    groupMembers,
    setShowGroupDialog,
    handleNavigate,
    t,
  }) => (
    <motion.div
      className="search-bar w-full max-w-5xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
        {/* Unified search container */}
        <div className="relative flex-1 flex flex-col md:flex-row gap-2">
          {/* Adventure selection */}
          <div className="flex-1 flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="flex items-center pl-3">
              <Compass className="h-5 w-5 text-gray-400" />
            </div>
            <select
              onChange={(e) => setadventure(e.target.value)}
              className="pl-2 py-6 text-base border-0 focus:ring-0 flex-1 bg-transparent"
              value={adventure}
            >
              <option value="all">{t('selectAdventure')}</option>
              {adventures.map((adventure, index) => (
                <option key={index} value={adventure?.name}>
                  {adventure?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location input */}
          <div className="flex-1 flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="flex items-center pl-3">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              onChange={(e) => setLocation(e.target.value)}
              className="pl-2 py-6 text-base border-0 focus:ring-0 flex-1"
              type="text"
              placeholder={t('searchLocation')}
              value={location}
              required
            />
          </div>

          {/* Date input */}
          <div className="flex-1 flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="flex items-center pl-3">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              onChange={(e) => setDate(e.target.value)}
              type="date"
              placeholder={t('selectDate')}
              className="pl-2 py-6 text-base border-0 focus:ring-0 flex-1"
              value={date}
              required
            />
          </div>

          {/* Group button */}
          <div className="flex-1 md:flex-initial flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <Button
              onClick={() => setShowGroupDialog(true)}
              className="w-full h-full px-4 py-6 bg-white hover:bg-gray-50 text-black"
            >
              <Users className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">
                {groupMembers.length > 0
                  ? `${t('group')} (${groupMembers.length + 1})`
                  : t('addGroup')}
              </span>
            </Button>
          </div>
        </div>

        {/* Search button - separated and bigger */}
        <Button
          onClick={handleNavigate}
          className="w-full md:w-auto mt-2 md:mt-0 py-6 px-8 bg-black hover:bg-gray-800 text-white text-lg font-medium rounded-lg shadow-md"
          disabled={!location || !date}
        >
          <Search className="h-6 w-6 mr-2" />
          <span>{t('search')}</span>
        </Button>
      </div>
    </motion.div>
  )
);

const PaginationComponent = memo(
  ({ eventsPage, eventsTotalPages, setEventsPage }) => {
    if (eventsTotalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-8 space-x-2">
        <Button
          variant="outline"
          onClick={() => setEventsPage((prev) => Math.max(1, prev - 1))}
          disabled={eventsPage === 1}
          className="flex items-center gap-2 px-4"
        >
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {eventsTotalPages <= 7 ? (
            // Show all pages if 7 or fewer
            Array.from({ length: eventsTotalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={eventsPage === pageNum ? 'default' : 'outline'}
                  onClick={() => setEventsPage(pageNum)}
                  className="w-10 h-10 p-0"
                  size="sm"
                >
                  {pageNum}
                </Button>
              )
            )
          ) : (
            <>
              <Button
                variant={eventsPage === 1 ? 'default' : 'outline'}
                onClick={() => setEventsPage(1)}
                className="w-10 h-10 p-0"
                size="sm"
              >
                1
              </Button>
              {eventsPage > 3 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {Array.from({ length: 3 }, (_, i) => {
                const pageNum = eventsPage - 1 + i;
                if (pageNum > 1 && pageNum < eventsTotalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={eventsPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setEventsPage(pageNum)}
                      className="w-10 h-10 p-0"
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}

              {eventsPage < eventsTotalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              {eventsTotalPages > 1 && (
                <Button
                  variant={
                    eventsPage === eventsTotalPages ? 'default' : 'outline'
                  }
                  onClick={() => setEventsPage(eventsTotalPages)}
                  className="w-10 h-10 p-0"
                  size="sm"
                >
                  {eventsTotalPages}
                </Button>
              )}
            </>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setEventsPage((prev) => Math.min(eventsTotalPages, prev + 1))
          }
          disabled={eventsPage === eventsTotalPages}
          className="flex items-center gap-2 px-4"
        >
          <span>Next</span>
        </Button>
      </div>
    );
  }
);

export default function LandingPage() {
  const Navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const naviagate = useNavigate();

  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [adventure, setadventure] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [eventsPage, setEventsPage] = useState(1);
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [viewMoreDialog, setViewMoreDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    participants: 1,
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [playerReady, setPlayerReady] = useState(false);

  const eventsLimit = 6;
  const playerRef = useRef(null);

  const {
    events,
    isLoading: eventsLoading,
    totalPages: eventsTotalPages,
  } = useEvents({
    page: eventsPage,
    limit: eventsLimit,
  });

  console.log(events);

  // Group events by country
  const countriesFromEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const countryMap = {};
    events.forEach((event) => {
      if (!countryMap[event.country]) {
        countryMap[event.country] = {
          name: event.country,
          events: [],
        };
      }
      countryMap[event.country].events.push(event);
    });

    return Object.values(countryMap);
  }, [events]);

  const currentCountry = useMemo(
    () => countriesFromEvents[currentCountryIndex] || null,
    [countriesFromEvents, currentCountryIndex]
  );

  console.log(user);

  // Auto-slide effect
  useEffect(() => {
    if (countriesFromEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCountryIndex((prev) => (prev + 1) % countriesFromEvents.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [countriesFromEvents.length]);

  // Reset currentCountryIndex when countries change
  useEffect(() => {
    if (currentCountryIndex >= countriesFromEvents.length) {
      setCurrentCountryIndex(0);
    }
  }, [countriesFromEvents.length, currentCountryIndex]);

  const nextCountry = useCallback(() => {
    setCurrentCountryIndex((prev) => (prev + 1) % countriesFromEvents.length);
  }, [countriesFromEvents.length]);

  const prevCountry = useCallback(() => {
    setCurrentCountryIndex(
      (prev) =>
        (prev - 1 + countriesFromEvents.length) % countriesFromEvents.length
    );
  }, [countriesFromEvents.length]);

  const handleBooking = useCallback((event) => {
    setSelectedEvent(event);
    setBookingDialog(true);
  }, []);

  const handleViewMore = useCallback((event) => {
    setSelectedEvent(event);
    setViewMoreDialog(true);
  }, []);

  const navigate = useNavigate();
  const submitBooking = useCallback(() => {
    // Validate booking form
    if (!bookingForm.email || !bookingForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        bookingData: bookingForm,
        selectedEvent: selectedEvent,
      },
    });

    // Close the booking dialog and reset form
    setBookingDialog(false);
    setBookingForm({
      participants: 1,
      email: '',
      phone: '',
      specialRequests: '',
    });
  }, [selectedEvent, bookingForm, navigate]);

  const { adventures, loading: adventureLoading } = useAdventures();
  const {
    friends,
    searchResult,
    loading: friendLoading,
    error,
    searchUser,
    sendRequest,
    clearSearchResult,
    fetchFriends,
  } = useFriend();

  // Fetch friends when component mounts or dialog opens
  useEffect(() => {
    if (showGroupDialog && friends.length === 0) {
      fetchFriends();
    }
  }, [showGroupDialog, fetchFriends, friends.length]);

  // Clear search results when dialog closes
  useEffect(() => {
    if (!showGroupDialog) {
      clearSearchResult();
      setSearchEmail('');
    }
  }, [showGroupDialog, clearSearchResult]);

  const handleSearchFriends = useCallback(
    async (e) => {
      e.preventDefault();

      if (!searchEmail.trim()) {
        toast(t('pleaseEnterEmail'), { type: 'error', position: 'top-right' });
        return;
      }

      try {
        const result = await searchUser(searchEmail);
        if (!result) {
          toast(t('noUsersFound'), { type: 'error', position: 'top-right' });
        }
      } catch (err) {
        toast(t('searchFailed'), { type: 'error', position: 'top-right' });
      }
    },
    [searchEmail, searchUser, t]
  );

  const addGroupMember = useCallback(
    (user) => {
      // Check if user is already in group
      if (groupMembers.some((member) => member._id === user._id)) {
        toast(t('userAlreadyInGroup'), {
          type: 'warning',
          position: 'top-right',
        });
        return;
      }

      setGroupMembers((prev) => [...prev, user]);
      clearSearchResult();
      setSearchEmail('');
      toast(t('friendAdded'), { type: 'success', position: 'top-right' });
    },
    [groupMembers, clearSearchResult, t]
  );

  const handleSendFriendRequest = useCallback(
    async (userId) => {
      try {
        await sendRequest(userId);
        toast(t('friendRequestSent'), {
          type: 'success',
          position: 'top-right',
        });
      } catch (err) {
        toast(t('failedToSendRequest'), {
          type: 'error',
          position: 'top-right',
        });
      }
    },
    [sendRequest, t]
  );

  const removeGroupMember = useCallback(
    (userId) => {
      // Remove from local state
      setGroupMembers((prev) => prev.filter((member) => member._id !== userId));

      // Remove from sessionStorage if present
      try {
        const stored = sessionStorage.getItem('groupMembers');
        if (stored) {
          const sessionMembers = JSON.parse(stored);
          const updatedSessionMembers = sessionMembers.filter(
            (member) => member._id !== userId
          );
          sessionStorage.setItem(
            'groupMembers',
            JSON.stringify(updatedSessionMembers)
          );
        }
      } catch {}

      toast(t('friendRemoved'), { type: 'success', position: 'top-right' });
    },
    [t]
  );

  const handleNavigate = useCallback(() => {
    // Check if required fields are filled
    if (!location || !date) {
      toast.error(
        t('pleaseSelectLocationAndDate') || 'Please select location and date'
      );
      return;
    }

    // Store group members in sessionStorage to access in booking page
    if (groupMembers.length > 0) {
      sessionStorage.setItem('groupMembers', JSON.stringify(groupMembers));
    }
    Navigate(
      `/browse?adventure=${adventure}&location=${location}&date=${date}`
    );
  }, [location, date, groupMembers, adventure, Navigate, t]);

  const onReady = useCallback(() => {
    const internalPlayer = playerRef.current?.getInternalPlayer();
    if (internalPlayer?.setPlaybackQuality) {
      internalPlayer.setPlaybackQuality('hd1080');
    }
    setPlayerReady(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Video */}
      <div className="bg absolute top-0 left-0 w-full h-screen overflow-hidden -z-50">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <Suspense fallback={<div className="w-full h-full bg-gray-900" />}>
          <ReactPlayer
            ref={playerRef}
            url={'https://youtu.be/FfPVvtNo92s'}
            onReady={onReady}
            controls={false}
            loop={true}
            playing={playerReady}
            muted={true}
            width="100%"
            height="100%"
            config={{
              youtube: {
                playerVars: {
                  showinfo: 0,
                  modestbranding: 1,
                  autoplay: 1,
                  rel: 0,
                  iv_load_policy: 3,
                },
              },
            }}
          />
        </Suspense>
      </div>

      <Nav_Landing />
      {/* Main Content - First Section */}
      <section className="flex items-center h-screen justify-center">
        <motion.div
          className="bg-white/80 backdrop-blur-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex-col w-[90%] rounded-lg shadow-lg border border-white/50"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <SearchBar
            adventures={adventures}
            adventure={adventure}
            setadventure={setadventure}
            location={location}
            setLocation={setLocation}
            date={date}
            setDate={setDate}
            groupMembers={groupMembers}
            setShowGroupDialog={setShowGroupDialog}
            handleNavigate={handleNavigate}
            t={t}
          />
        </motion.div>
      </section>

      {/* Featured Events Content */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 md:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing adventures across different countries
            </p>
          </motion.div>

          {/* Country Slider - Always show if we have events */}
          {countriesFromEvents.length > 0 && (
            <div className="relative mb-12">
              <motion.div
                className="flex justify-center items-center mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevCountry}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center space-x-8 mx-8">
                  {countriesFromEvents.map((country, index) => (
                    <motion.div
                      key={country?.name}
                      className={`cursor-pointer transition-all duration-500 ${
                        index === currentCountryIndex
                          ? 'scale-125 text-2xl font-bold text-gray-900'
                          : 'scale-100 text-lg text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={() => setCurrentCountryIndex(index)}
                      whileHover={{
                        scale: index === currentCountryIndex ? 1.25 : 1.1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {country?.name}
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextCountry}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>

              {/* Country Indicator Dots */}
              <div className="flex justify-center space-x-2 mb-8">
                {countriesFromEvents.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                      index === currentCountryIndex
                        ? 'w-8 bg-gray-900'
                        : 'w-2 bg-gray-300'
                    }`}
                    onClick={() => setCurrentCountryIndex(index)}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Events Grid */}
          {eventsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : countriesFromEvents.length > 0 ? (
            /* Show country-specific events */
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCountryIndex}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                {currentCountry?.events.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EventCard
                      event={event}
                      handleBooking={handleBooking}
                      handleViewMore={handleViewMore}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Show empty state when no events */
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg">
                No events available at the moment.
              </p>
            </div>
          )}

          {/* Booking Dialog */}
          <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
            <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Book Your Event
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {selectedEvent?.title} in {selectedEvent?.city},{' '}
                  {selectedEvent?.country}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Event Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={selectedEvent?.image || '/placeholder.svg'}
                      alt={selectedEvent?.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedEvent?.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedEvent?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedEvent?.startTime} - {selectedEvent?.endTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {selectedEvent?.date &&
                          new Date(selectedEvent.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="participants"
                      className="text-sm font-medium text-gray-700"
                    >
                      Number of Participants
                    </Label>
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      max="10"
                      value={bookingForm.participants}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          participants: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="mt-1"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingForm.email || user?.user?.email || ''}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="mt-1"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingForm.phone || user?.user?.phone || ''}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="mt-1"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setBookingDialog(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitBooking}
                  className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white px-6"
                  disabled={!bookingForm.email || !bookingForm.phone}
                >
                  Continue to Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View More Dialog */}
          <Dialog open={viewMoreDialog} onOpenChange={setViewMoreDialog}>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {selectedEvent?.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {selectedEvent?.city}, {selectedEvent?.country}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Event Image */}
                <div className="relative h-64 overflow-hidden rounded-xl">
                  <img
                    src={selectedEvent?.image || '/placeholder.svg'}
                    alt={selectedEvent?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">Location Details</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      <p className="text-gray-900 font-medium">
                        {selectedEvent?.city}, {selectedEvent?.country}
                      </p>
                      {selectedEvent?.location && (
                        <p className="text-gray-600 text-sm">
                          {selectedEvent.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time & Date */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">Schedule</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      <p className="text-gray-900 font-medium">
                        {selectedEvent?.startTime} - {selectedEvent?.endTime}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedEvent?.date &&
                          new Date(selectedEvent.date).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adventures Section */}
                {selectedEvent?.adventures &&
                  selectedEvent.adventures.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Compass className="h-5 w-5" />
                        <span className="font-semibold">
                          Adventures Included
                        </span>
                      </div>
                      <div className="pl-7 space-y-2">
                        {selectedEvent.adventures.map((adventure, index) => (
                          <div
                            key={adventure._id || index}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            {adventure.thumbnail && (
                              <img
                                src={adventure.thumbnail}
                                alt={adventure?.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {adventure?.name}
                              </h5>
                              {adventure.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {adventure.description}
                                </p>
                              )}
                              {adventure.exp && (
                                <div className="flex items-center mt-2">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs text-gray-500">
                                    {adventure.exp} XP
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* NFT Reward Section */}
                {selectedEvent?.isNftEvent && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Star className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">NFT Reward</span>
                    </div>
                    <div className="pl-7">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-900">
                            Exclusive NFT Available
                          </span>
                        </div>
                        <p className="text-sm text-purple-700">
                          Complete all adventures in this event to earn an
                          exclusive NFT reward!
                        </p>
                        {selectedEvent.nftReward?.nftName && (
                          <div className="mt-3 space-y-1">
                            <p className="text-sm font-medium text-purple-900">
                              NFT: {selectedEvent.nftReward.nftName}
                            </p>
                            {selectedEvent.nftReward.nftDescription && (
                              <p className="text-xs text-purple-700">
                                {selectedEvent.nftReward.nftDescription}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Description */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Compass className="h-5 w-5" />
                    <span className="font-semibold">About This Event</span>
                  </div>
                  <div className="pl-7">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedEvent?.description}
                    </p>
                  </div>
                </div>

                {/* Additional Event Info (if available) */}
                {(selectedEvent?.price ||
                  selectedEvent?.maxParticipants ||
                  selectedEvent?.difficulty) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Event Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {selectedEvent?.price && (
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <p className="font-medium text-gray-900">
                            ${selectedEvent.price}
                          </p>
                        </div>
                      )}
                      {selectedEvent?.maxParticipants && (
                        <div>
                          <span className="text-gray-600">
                            Max Participants:
                          </span>
                          <p className="font-medium text-gray-900">
                            {selectedEvent.maxParticipants}
                          </p>
                        </div>
                      )}
                      {selectedEvent?.difficulty && (
                        <div>
                          <span className="text-gray-600">Difficulty:</span>
                          <p className="font-medium text-gray-900">
                            {selectedEvent.difficulty}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setViewMoreDialog(false)}
                  className="px-6"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewMoreDialog(false);
                    handleBooking(selectedEvent);
                  }}
                  className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white px-6"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Book Your Spot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <PaginationComponent
        eventsPage={eventsPage}
        eventsTotalPages={eventsTotalPages}
        setEventsPage={setEventsPage}
      />

      {/* Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">
              {t('addFriendsToGroup')}
            </DialogTitle>
            <DialogDescription>
              {t('inviteFriendsDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearchFriends} className="flex gap-2 mb-4 mt-4">
            <Input
              type="email"
              placeholder={t('searchByEmail')}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 focus:ring-2 focus:ring-gray-500"
            />{' '}
            <Button
              type="submit"
              disabled={friendLoading.search || !searchEmail}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
            >
              {friendLoading.search ? t('searching') : t('search')}
              <Search size={16} />
            </Button>
          </form>{' '}
          {/* Search Results */}
          {searchResult && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {t('searchResults')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage
                        src={
                          searchResult.user?.profilePicture ||
                          '/placeholder.svg'
                        }
                        alt={searchResult.user?.name}
                      />
                      <AvatarFallback>
                        {searchResult.user?.name?.charAt(0) ||
                          searchResult.user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {searchResult.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {searchResult.user?.email}
                      </p>
                      {searchResult.isAlreadyFriend && (
                        <p className="text-xs text-green-600">
                          {t('alreadyFriends')}
                        </p>
                      )}
                      {searchResult.hasPendingRequest && (
                        <p className="text-xs text-orange-600">
                          {searchResult.requestStatus?.isSentByMe
                            ? t('requestSent')
                            : t('requestReceived')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {searchResult.isAlreadyFriend ? (
                      <Button
                        size="sm"
                        onClick={() => addGroupMember(searchResult.user)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <UserPlus size={14} />
                        {t('add')}
                      </Button>
                    ) : searchResult.hasPendingRequest ? (
                      <Button
                        size="sm"
                        disabled
                        className="flex items-center gap-1 bg-gray-400 text-white cursor-not-allowed"
                      >
                        {searchResult.requestStatus?.isSentByMe
                          ? t('requestSent')
                          : t('requestReceived')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSendFriendRequest(searchResult.user._id)
                          }
                          disabled={friendLoading.action}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <UserPlus size={14} />
                          {friendLoading.action
                            ? t('sending')
                            : t('sendRequest')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => addGroupMember(searchResult.user)}
                          className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white"
                        >
                          <UserPlus size={14} />
                          {t('addDirectly')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Show error if search failed */}
          {error.search && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error.search}</p>
            </div>
          )}
          {/* Existing Friends List */}
          {showFriendsList && friends.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  {t('yourFriends')}
                </h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {friends
                  .filter(
                    (friend) =>
                      !groupMembers.some((member) => member._id === friend._id)
                  )
                  .map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-gray-100">
                          <AvatarImage
                            src={friend.profilePicture || '/placeholder.svg'}
                            alt={friend?.name}
                          />
                          <AvatarFallback className="text-xs">
                            {friend?.name?.charAt(0) || friend.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {friend?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {friend.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addGroupMember(friend)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                      >
                        <UserPlus size={12} />
                        {t('add')}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {/* Loading friends */}
          {friendLoading.friends && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
              <p className="text-gray-600 text-sm">{t('loadingFriends')}</p>
            </div>
          )}
          {/* Group Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {t('yourGroup')} ({groupMembers.length + 1})
              </h3>
            </div>
            {/* Current User */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gray-100 bg-black">
                  <AvatarFallback className="text-white">
                    {user?.user?.email
                      ? user?.user?.email.charAt(0).toUpperCase()
                      : 'Y'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">
                    {user?.user?.email ? user.user.email : 'You'}
                  </p>
                  <p className="text-xs text-gray-500">{t('groupLeader')}</p>
                </div>
              </div>
            </div>{' '}
            <AnimatePresence>
              {groupMembers.map((member) => (
                <motion.div
                  key={member._id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                      <AvatarImage
                        src={member.profilePicture || '/placeholder.svg'}
                        alt={member?.name}
                      />
                      <AvatarFallback>
                        {member?.name?.charAt(0) || member.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {member?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeGroupMember(member._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <UserX size={14} />
                    {t('remove')}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {groupMembers.length === 0 && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">{t('noFriendsYet')}</p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowGroupDialog(false)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {t('done')}
            </Button>{' '}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
