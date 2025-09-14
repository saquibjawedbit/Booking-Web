import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getEventById } from '../Api/event.api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useAuth } from './AuthProvider';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await getEventById(id);
        if (response.success) {
          setEvent(response.data);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event details');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDisplayTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBooking = () => {
    if (!user?.user) {
      // Store current URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.info('Please login to book this event');
      navigate('/login');
      return;
    }

    const userLevel = user?.user?.level || 1;
    const requiredLevel = event?.level || 1;

    if (userLevel < requiredLevel) {
      toast.error(
        `You need to be level ${requiredLevel} or higher to book this event. Your current level is ${userLevel}.`
      );
      return;
    }

    // Here you would implement the actual booking logic
    toast.success('Booking feature will be implemented soon!');
  };

  const canBook = () => {
    if (!user?.user) return false;
    const userLevel = user?.user?.level || 1;
    const requiredLevel = event?.level || 1;
    return userLevel >= requiredLevel;
  };

  const getBookingButtonText = () => {
    if (!user?.user) return 'Login to Book';
    if (!canBook()) return `Level ${event?.level || 1} Required`;
    return 'Book Now';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Event
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Event not found'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Images */}
            {event?.medias && event?.medias.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {event?.medias.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={imageUrl || '/placeholder.svg'}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="hidden w-full h-full items-center justify-center bg-gray-100 text-gray-400 text-sm"
                          style={{ display: 'none' }}
                        >
                          Image not available
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl font-bold">
                      {event?.title}
                    </CardTitle>
                    <div className="flex items-center mt-2 space-x-4">
                      <Badge variant="secondary">
                        <Star className="mr-1 h-3 w-3" />
                        Level {event?.level || 1}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {event?.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {formatDisplayDate(event?.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">
                          {formatDisplayTime(event?.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{event?.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.user && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Your Level: {user?.user?.level || 1}
                    </p>
                    <p className="text-sm text-gray-600">
                      Required Level: {event?.level || 1}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  disabled={user?.user && !canBook()}
                  className="w-full"
                  size="lg"
                >
                  {getBookingButtonText()}
                </Button>

                {user?.user && !canBook() && (
                  <p className="text-sm text-red-600 text-center">
                    You need to reach level {event?.level || 1} to book this
                    event.
                  </p>
                )}

                {!user?.user && (
                  <p className="text-sm text-gray-600 text-center">
                    Sign in to book this event and see personalized
                    recommendations.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Event Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Required Level</span>
                  <Badge variant="outline">Level {event?.level || 1}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">
                    {new Date(event?.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">
                    {formatDisplayTime(event?.time)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
