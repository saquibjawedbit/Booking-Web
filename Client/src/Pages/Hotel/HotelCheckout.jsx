'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bed,
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  Hotel as HotelIcon,
  MapPin,
  Shield,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createHotelBooking } from '../../Api/hotelBooking.api';
import { Navbar } from '../../components/Navbar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Slider } from '../../components/ui/slider';

export default function HotelCheckout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Get hotel data from location state or redirect back
  const hotelData = location.state?.hotel;

  if (!hotelData) {
    useEffect(() => {
      toast.error('No hotel selected for booking');
      navigate('/hotels');
    }, []);
    return null;
  }
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate:
      location.state?.checkInDate || new Date().toISOString().split('T')[0],
    checkOutDate:
      location.state?.checkOutDate ||
      new Date(Date.now() + 86400000).toISOString().split('T')[0],
    rooms: location.state?.rooms || 1,
    guests:
      typeof location.state?.guests === 'object'
        ? (location.state.guests.adults || 1) +
          (location.state.guests.children || 0)
        : location.state?.guests || 2,
    specialRequests: '',
  });

  // Calculate stay duration in nights
  const nights = Math.ceil(
    (new Date(bookingDetails.checkOutDate) -
      new Date(bookingDetails.checkInDate)) /
      (1000 * 60 * 60 * 24)
  );

  // Calculate total price
  const roomRate = hotelData.pricePerNight || hotelData.price || 0;
  const totalPrice = roomRate * bookingDetails.rooms * nights;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e, paymentMode) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Prepare booking data
      const bookingData = {
        guests: bookingDetails.guests,
        numberOfRooms: bookingDetails.rooms,
        hotel: hotelData._id,
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        specialRequests: bookingDetails.specialRequests,
        modeOfPayment: paymentMode,
      };
      // Make API request to create hotel booking
      const response = await createHotelBooking(bookingData);

      // Check for successful booking
      if (response.data && response.data.data) {
        window.location.href = response.data.data.checkout_url;
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to process booking. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20 max-w-7xl mx-auto px-4 py-8"
      >
        {/* Back navigation */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900 p-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HotelIcon className="h-8 w-8 text-blue-600" />
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-1">
            Please review your reservation details and provide payment
            information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main booking form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Hotel details summary */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Hotel Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                      <img
                        src={
                          hotelData.logo ||
                          hotelData.medias?.[0] ||
                          '/placeholder.svg'
                        }
                        alt={hotelData?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {hotelData?.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {hotelData.location?.name || 'Location not specified'}
                        </span>
                      </div>
                      {hotelData.rating !== undefined && (
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < Math.round(hotelData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-medium">
                          {new Date(
                            bookingDetails.checkInDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <CalendarCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-medium">
                          {new Date(
                            bookingDetails.checkOutDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Bed className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Rooms</p>
                        <p className="font-medium">{bookingDetails.rooms}</p>
                      </div>
                    </div>{' '}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Guests</p>
                        <p className="font-medium">{bookingDetails.guests}</p>
                      </div>
                    </div>{' '}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {nights} {nights === 1 ? 'night' : 'nights'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Configuration */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Booking Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Number of Rooms Slider */}
                    <div>
                      <Label className="text-base font-medium">
                        Number of Rooms: {bookingDetails.rooms}
                      </Label>
                      <div className="mt-3">
                        <Slider
                          value={[bookingDetails.rooms]}
                          onValueChange={(value) =>
                            setBookingDetails((prev) => ({
                              ...prev,
                              rooms: value[0],
                            }))
                          }
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>1 room</span>
                          <span>10 rooms</span>
                        </div>
                      </div>
                    </div>

                    {/* Number of Guests Slider */}
                    <div>
                      <Label className="text-base font-medium">
                        Number of Guests: {bookingDetails.guests}
                      </Label>
                      <div className="mt-3">
                        <Slider
                          value={[bookingDetails.guests]}
                          onValueChange={(value) =>
                            setBookingDetails((prev) => ({
                              ...prev,
                              guests: value[0],
                            }))
                          }
                          max={20}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>1 guest</span>
                          <span>20 guests</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <Label htmlFor="specialRequests">Special Requests</Label>
                      <Input
                        id="specialRequests"
                        name="specialRequests"
                        placeholder="Any special requests or preferences"
                        value={bookingDetails.specialRequests}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Payment Method</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Payment will be processed securely at the final step
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-white">
                        Visa
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        MasterCard
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        American Express
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        PayPal
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm mt-4">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      Your payment info is secure and encrypted
                    </span>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Room Rate (${roomRate}/night)
                    </span>
                    <span>${roomRate.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span>
                      {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Rooms</span>
                    <span>{bookingDetails.rooms}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <p>
                      You'll be charged the total amount after confirming this
                      booking.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    size="lg"
                    disabled={isLoading}
                    onClick={(e) => handleSubmit(e, 'revolut')}
                  >
                    <CreditCard className="h-5 w-5" />
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Confirm and Pay with Revolut</>
                    )}
                  </Button>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    size="lg"
                    disabled={isLoading}
                    onClick={(e) => handleSubmit(e, 'paypal')}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <path d="M29.8 13.8c-.3-2.2-2.2-3.7-4.7-3.7h-7.8c-.5 0-.9.3-1 .8l-3.2 15.2c-.1.4.2.8.6.8h4.1c.5 0 .9-.3 1-.8l.9-4.2c.1-.5.5-.8 1-.8h2.6c4.1 0 7.3-2.1 8.2-6.4.2-.7.2-1.3.3-1.9zm-3.2 2.1c-.6 2.7-2.7 3.9-5.6 3.9h-1.7l1.1-5.2c.1-.5.5-.8 1-.8h1.7c1.2 0 2.1.3 2.7.8.6.5.8 1.3.6 2.3z" />
                    </svg>
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Confirm and Pay with PayPal</>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    By confirming, you agree to our{' '}
                    <Link className="text-blue-600 underline" to="/terms">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link className="text-blue-600 underline" to="/terms">
                      Cancellation Policy
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
