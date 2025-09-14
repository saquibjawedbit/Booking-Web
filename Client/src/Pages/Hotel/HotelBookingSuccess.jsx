'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Check,
  Download,
  Home,
  Hotel as HotelIcon,
  MapPin,
  Printer,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getHotelBookingById } from '../../Api/hotelBooking.api';
import { Navbar } from '../../components/Navbar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

export default function HotelBookingSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingDetails, setBookingDetails] = useState(
    location.state?.bookingDetails || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const bookingId = location.state?.bookingId;

  // Redirect if there's no booking data
  useEffect(() => {
    if (!bookingId && !bookingDetails) {
      toast.error('Booking information not found');
      navigate('/hotels');
      return;
    }

    // If we have a bookingId but no details, fetch them
    if (bookingId && !bookingDetails) {
      const fetchBookingDetails = async () => {
        setIsLoading(true);
        try {
          const response = await getHotelBookingById(bookingId);

          if (response.data && response.data.success) {
            setBookingDetails(response.data.data);
          } else {
            toast.error('Failed to fetch booking details');
            navigate('/hotels');
          }
        } catch (error) {
          console.error('Error fetching booking details:', error);
          toast.error(
            'An error occurred while retrieving your booking information'
          );
          navigate('/hotels');
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookingDetails();
    }
  }, [bookingId, bookingDetails, navigate]);

  if (isLoading || !bookingDetails) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">
              Loading your booking details...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Extract details for easier access
  const hotel = bookingDetails.hotels?.[0]?.hotel || {};
  const bookingDate = bookingDetails.createdAt
    ? new Date(bookingDetails.createdAt).toLocaleDateString()
    : 'N/A';
  const checkInDate =
    hotel.startDate ||
    bookingDetails.hotels?.[0]?.startDate ||
    hotel.checkInDate ||
    bookingDetails.hotels?.[0]?.checkInDate;
  const checkOutDate =
    hotel.endDate ||
    bookingDetails.hotels?.[0]?.endDate ||
    hotel.checkOutDate ||
    bookingDetails.hotels?.[0]?.checkOutDate;
  const formattedCheckInDate = checkInDate
    ? new Date(checkInDate).toLocaleDateString()
    : 'N/A';
  const formattedCheckOutDate = checkOutDate
    ? new Date(checkOutDate).toLocaleDateString()
    : 'N/A';
  const roomQuantity = bookingDetails.hotels?.[0]?.quantity || 1;

  const handlePrintConfirmation = () => {
    window.print();
  };

  const handleDownloadConfirmation = () => {
    // This is a placeholder. In a real app, you would generate a PDF or
    // make an API call to get a downloadable confirmation
    toast.info('Download functionality will be implemented soon');
  };

  return (
    <div className="min-h-screen bg-white print:bg-white print:pt-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20 max-w-4xl mx-auto px-4 py-8 print:pt-4"
      >
        {/* Success message */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4 print:hidden">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your reservation has been successfully processed and confirmed
          </p>
        </div>

        {/* Booking details card */}
        <Card className="mb-6 border-2 border-green-100 shadow-md print:shadow-none print:border">
          <CardHeader className="border-b pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <HotelIcon className="h-5 w-5 text-blue-600" />
                <span>Booking Details</span>
              </CardTitle>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 bg-green-50"
              >
                Confirmed
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column - Hotel info */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-20 h-20 rounded-md overflow-hidden shrink-0">
                    <img
                      src={
                        hotel.logo || hotel.medias?.[0] || '/placeholder.svg'
                      }
                      alt={hotel?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{hotel?.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {hotel.location?.name || 'Location not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-medium text-sm">
                          {formattedCheckInDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-medium text-sm">
                          {formattedCheckOutDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {bookingDetails.guestInfo && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <p className="font-medium text-sm">Guest Information</p>
                      </div>
                      <p className="text-sm">
                        {bookingDetails.guestInfo.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bookingDetails.guestInfo.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bookingDetails.guestInfo.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Booking summary */}
              <div className="flex-1">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID</span>
                      <span className="font-mono">
                        {bookingDetails._id?.substring(0, 8) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date</span>
                      <span>{bookingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room(s)</span>
                      <span>{roomQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span>{bookingDetails.modeOfPayment || 'Card'}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>${bookingDetails.amount?.toFixed(2) || 'N/A'}</span>
                    </div>

                    {bookingDetails.status && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge
                          variant={
                            bookingDetails.status === 'confirmed'
                              ? 'success'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {bookingDetails.status.charAt(0).toUpperCase() +
                            bookingDetails.status.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Special requests */}
            {bookingDetails.specialRequests && (
              <div className="mt-6 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Special Requests
                </p>
                <p className="text-sm text-blue-700">
                  {bookingDetails.specialRequests}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 print:hidden">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrintConfirmation}
          >
            <Printer className="h-4 w-4" />
            Print Confirmation
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownloadConfirmation}
          >
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
        </div>

        {/* Next actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          <Card
            className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => navigate('/user/bookings')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">View My Bookings</h3>
                  <p className="text-sm text-gray-600">
                    Manage all your reservations
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card
            className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => navigate('/hotels')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Browse More Hotels</h3>
                  <p className="text-sm text-gray-600">
                    Discover other places to stay
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-sm mt-8 print:mt-4">
          A confirmation email has been sent to your email address.
          <br />
          For any assistance, please contact our customer support.
        </p>
      </motion.div>
    </div>
  );
}
