import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Home,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

const CartSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');

  useEffect(() => {
    const handlePaymentRedirect = async () => {
      if (!orderId) {
        toast.error('No order ID found');
        navigate('/cart');
        return;
      }

      try {
        const response = await fetch(
          `/api/itemBooking/payment/redirect?order_id=${orderId}&status=${status}`
        );
        const data = await response.json();

        if (data.success) {
          setBookingDetails(data.data);
          if (
            data.data.redirectStatus === 'completed' ||
            data.data.redirectStatus === 'success'
          ) {
            toast.success('Payment completed successfully!');
          }
        } else {
          toast.error('Failed to process payment redirect');
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error handling payment redirect:', error);
        toast.error('An error occurred while processing your payment');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentRedirect();
  }, [orderId, status, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">No booking details found</p>
            <Button onClick={() => navigate('/cart')} className="mt-4">
              Return to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { booking, paymentStatus, redirectStatus } = bookingDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your order has been confirmed and is being processed.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Details
                </span>
                <Badge className={getStatusColor(paymentStatus)}>
                  {paymentStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{booking._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Order ID</p>
                  <p className="font-semibold">{booking.paymentOrderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{booking.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">
                    £{booking.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {booking.paymentCompletedAt && (
                <div>
                  <p className="text-sm text-gray-600">Payment Completed</p>
                  <p className="font-semibold flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(booking.paymentCompletedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ordered Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.item.images?.[0] || '/placeholder.svg'}
                      alt={item.item?.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.item?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.item.category}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm">
                          Quantity: {item.quantity}
                        </span>
                        {item.rentalPeriod && (
                          <Badge variant="secondary">
                            Rental: {item.rentalPeriod.days} days
                          </Badge>
                        )}
                        {item.purchase && (
                          <Badge variant="default">Purchase</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        £
                        {item.purchase
                          ? (item.item.price * item.quantity).toFixed(2)
                          : (
                              item.item.rentalPrice *
                              item.quantity *
                              item.rentalPeriod.days
                            ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => navigate('/shop')}
              className="flex items-center bg-black hover:bg-gray-800"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Need help with your order? Contact our support team at{' '}
              <a
                href="mailto:support@yoursite.com"
                className="font-semibold underline"
              >
                support@yoursite.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CartSuccess;
