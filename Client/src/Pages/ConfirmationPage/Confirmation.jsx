'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  MapPin,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { BackgroundElems } from './BackgroundElems';

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Get booking data from navigation state
    if (location.state) {
      setBookingData(location.state);
    }
  }, [location.state]);

  // Generate a mock booking reference if not available
  const generateBookingRef = () => {
    return `ADV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-indigo-100 p-4 sm:p-6 relative overflow-hidden">
      {/* Background elements */}
      <BackgroundElems />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Booking Confirmation
          </h1>
        </div>

        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl mb-8 border border-white/50 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="mx-auto mb-6 text-green-500"
          >
            <CheckCircle size={80} className="mx-auto" />
          </motion.div>{' '}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Booking Successful!
          </h2>
          <p className="text-gray-600 mb-8">
            {bookingData
              ? `Your ${bookingData.adventure?.name || 'adventure'} has been booked successfully. We've sent a confirmation email with all the details.`
              : "Your adventure has been booked successfully. We've sent a confirmation email with all the details."}
          </p>
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Booking Details</h3>
            <div className="space-y-3 text-left">
              {/* Adventure Details */}
              {bookingData?.adventure && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-800">
                      {bookingData.adventure?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {bookingData.adventure.date
                        ? new Date(
                            bookingData.adventure.date
                          ).toLocaleDateString()
                        : 'Date TBD'}
                      {bookingData.adventure.time &&
                        ` at ${bookingData.adventure.time}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Location Details */}
              {bookingData?.adventure?.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(bookingData.adventure.location)
                        ? bookingData.adventure.location[0]?.name ||
                          'Location TBD'
                        : bookingData.adventure.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Instructor Details */}
              {bookingData?.selectedInstructor && (
                <div className="flex items-start gap-3">
                  <Users className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-800">Instructor</p>
                    <p className="text-sm text-gray-500">
                      {bookingData.selectedInstructor.instructorId?.name ||
                        bookingData.selectedInstructor?.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Group Size */}
              {bookingData?.groupMembers &&
                bookingData.groupMembers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="text-blue-600 mt-0.5" size={18} />
                    <div>
                      <p className="font-medium text-gray-800">Group Size</p>
                      <p className="text-sm text-gray-500">
                        {bookingData.groupMembers.length + 1} people
                      </p>
                    </div>
                  </div>
                )}

              {/* Items Booked */}
              {bookingData?.cartItems && bookingData.cartItems.length > 0 && (
                <div className="flex items-start gap-3">
                  <ShoppingCart className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-800">Items Booked</p>
                    <p className="text-sm text-gray-500">
                      {bookingData.cartItems.length} items selected
                    </p>
                  </div>
                </div>
              )}

              {/* Hotel Booking */}
              {bookingData?.selectedHotel && (
                <div className="flex items-start gap-3">
                  <Building className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-800">Accommodation</p>
                    <p className="text-sm text-gray-500">
                      Hotel booking confirmed
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Reference */}
              <div className="flex items-start gap-3">
                <div className="w-[18px] h-[18px] rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mt-0.5">
                  #
                </div>
                <div>
                  <p className="font-medium text-gray-800">Booking Reference</p>
                  <p className="text-sm text-gray-500">
                    {generateBookingRef()}
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              {bookingData?.totalAmount && (
                <div className="flex items-start gap-3 pt-2 border-t border-blue-200">
                  <div className="w-[18px] h-[18px] rounded-full bg-green-600 flex items-center justify-center text-white text-xs mt-0.5">
                    $
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Total Amount</p>
                    <p className="text-sm text-gray-500">
                      ${bookingData.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/70"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => navigate('/my-bookings')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              View My Bookings
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-sm"
        >
          Need help? Contact our support team at support@adventures.com
        </motion.div>
      </div>
    </div>
  );
}
