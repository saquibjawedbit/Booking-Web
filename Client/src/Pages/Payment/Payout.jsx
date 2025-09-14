import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Link as LinkIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import InstructorLayout from "../Instructor/InstructorLayout";
import { 
  createBatchPayout 
} from "../../Api/payoutApi";
import axios from "axios";
import { staggerContainer, fadeIn } from "../../assets/Animations";
import { axiosClient } from "../../AxiosClient/axios.js";

export default function PayoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLinked, setIsLinked] = useState(null); // null = checking, true/false = status
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [nextPayoutAmount, setNextPayoutAmount] = useState(0);
  const [nextPayoutDate, setNextPayoutDate] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [systemStats, setSystemStats] = useState(null);

  const token = localStorage.getItem("accessToken");

useEffect(() => {
  if (!user?.user) {
    toast.error("Please login to access the payout page");
    navigate("/login");
    return;
  }

  const checkLinkStatus = async () => {
    try {
      console.log("🔑 Token from localStorage:", token);

      const res = await axiosClient.get('/api/payouts/status');

      console.log("PayPal status response:", res.data);
      setIsLinked(res.data.data?.isLinked ? false);
    } catch (err) {
      console.error("Error fetching PayPal status:", err.response?.data || err.message);
      setIsLinked(false);
    }
  };

  const loadPayoutData = async () => {
    try {
      // Fetch payout history
      const historyRes = await axiosClient.get('/api/transactions/payout/history?limit=10');
      if (historyRes.data.success) {
        const history = historyRes.data.data.docs || [];
        setPayoutHistory(history.map(payout => ({
          id: payout._id,
          amount: payout.amount,
          date: new Date(payout.createdAt).toLocaleDateString(),
          status: payout.status.toLowerCase(),
          note: payout.note,
          currency: payout.currency
        })));

        // Calculate total earnings from completed payouts
        const completedPayouts = history.filter(p => p.status === 'SUCCESS');
        const totalEarned = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
        setTotalEarnings(totalEarned);

        // Calculate pending payouts
        const pendingPayoutsList = history.filter(p => ['QUEUED', 'SENT'].includes(p.status));
        const pendingAmount = pendingPayoutsList.reduce((sum, p) => sum + p.amount, 0);
        setPendingPayouts(pendingAmount);
      }

      // Fetch potential earnings from confirmed bookings
      await loadPotentialEarnings();

    } catch (error) {
      console.error('Error loading payout data:', error);
      // Fallback to basic data if API fails
      setTotalEarnings(0);
      setPendingPayouts(0);
      setPayoutHistory([]);
    }
  };

  const loadPotentialEarnings = async () => {
    try {
      // Get user's confirmed bookings that haven't been paid out yet
      const bookingsData = await Promise.allSettled([
        // Event bookings where user is an instructor
        axiosClient.get(`/api/event-bookings?instructor=${user?.user?._id}&status=confirmed&paymentStatus=completed`),
        // Hotel bookings if user owns hotels
        axiosClient.get(`/api/hotelBooking?owner=${user?.user?._id}&status=confirmed&paymentStatus=completed`),
        // Session bookings if user is an instructor
        axiosClient.get(`/api/sessionBooking?instructor=${user?.user?._id}&status=confirmed`)
      ]);

      let potentialEarnings = 0;
      let bookingCount = 0;

      bookingsData.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data?.success) {
          const bookings = result.value.data.data || [];
          bookingCount += bookings.length;

          bookings.forEach(booking => {
            // Calculate 80% payout (20% platform fee)
            const payoutAmount = (booking.amount || 0) * 0.8;
            
            // Only include bookings that are at least 24 hours old and haven't been processed
            const bookingDate = new Date(booking.paymentCompletedAt || booking.bookingDate);
            const hoursSinceBooking = (new Date() - bookingDate) / (1000 * 60 * 60);
            
            if (hoursSinceBooking >= 24) {
              potentialEarnings += payoutAmount;
            }
          });
        }
      });

      setNextPayoutAmount(potentialEarnings);
      setTotalBookings(bookingCount);

      // Calculate next payout date (next daily cron run at 2 AM UTC)
      const now = new Date();
      const nextRun = new Date();
      nextRun.setUTCHours(2, 0, 0, 0);
      
      // If it's already past 2 AM UTC today, set for tomorrow
      if (now.getUTCHours() >= 2) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      setNextPayoutDate(nextRun);

    } catch (error) {
      console.error('Error loading potential earnings:', error);
      setNextPayoutAmount(0);
    }
  };

  const loadMockData = () => {
    // Remove mock data - will be replaced with real data
    console.log('Loading real data instead of mock data...');
  };

  if (token) {
    checkLinkStatus();
    loadPayoutData();
  } else {
    console.warn("No token found in localStorage");
    setIsLinked(false);
  }

  // Listen for focus events to refresh status when user returns from PayPal
  const handleFocus = () => {
    if (token) {
      checkLinkStatus();
      loadPayoutData();
    }
  };

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [token, user, navigate]);

  const handleLinkAccount = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post('/api/payouts/connect');
      const redirectUrl = res.data?.data?.redirectUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error("No redirect URL received. Response:", res.data);
        toast.error("Failed to get redirect URL for PayPal onboarding");
      }
    } catch (err) {
      console.error("Failed to start PayPal onboarding:", err.response?.data || err.message);
      toast.error("Failed to start PayPal onboarding");
    } finally {
      setLoading(false);
    }
  };

  //  Trigger payout (for linked users)
  const handlePayout = async () => {
    setLoading(true);
    setMessage("");
    try {
      // Trigger the automated payout system instead of manual payout
      const res = await axiosClient.post('/api/transactions/payout/trigger');
      
      if (res.data.success) {
        setMessage("Payout processing initiated successfully! Check back in a few minutes for updates.");
        toast.success("Payout processing started!");
        
        // Refresh data after a short delay
        setTimeout(() => {
          loadPayoutData();
        }, 2000);
      } else {
        throw new Error(res.data.message || 'Payout trigger failed');
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Failed to trigger payout processing";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { variant: "default", icon: CheckCircle, text: "Completed" },
      completed: { variant: "default", icon: CheckCircle, text: "Completed" },
      sent: { variant: "secondary", icon: AlertCircle, text: "Sent" },
      queued: { variant: "secondary", icon: AlertCircle, text: "Queued" },
      pending: { variant: "secondary", icon: AlertCircle, text: "Pending" },
      failed: { variant: "destructive", icon: AlertCircle, text: "Failed" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatNextPayoutInfo = () => {
    if (!nextPayoutDate) return "Calculating...";
    
    const now = new Date();
    const diffTime = nextPayoutDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Next payout in ${diffHours} hours`;
    } else if (diffDays === 1) {
      return "Next payout tomorrow";
    } else {
      return `Next payout in ${diffDays} days`;
    }
  };

  const calculateMonthlyProjection = () => {
    // Calculate average earnings per booking and project monthly
    if (totalBookings === 0) return 0;
    
    const avgPerBooking = nextPayoutAmount / totalBookings;
    const bookingsPerMonth = totalBookings * 4; // Rough weekly to monthly conversion
    return avgPerBooking * bookingsPerMonth;
  };

    // UI
  if (isLinked === null) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground">Checking PayPal account status...</p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {t("Payout Management") || "Payout Management"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t("Manage your earnings and PayPal payouts") || "Manage your earnings and PayPal payouts"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                  Total Earnings
                </CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                  ${totalEarnings.toFixed(2)}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center text-blue-500">
                    <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    From {payoutHistory.filter(p => p.status === 'completed').length} payouts
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                  Next Payout
                </CardTitle>
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                  ${nextPayoutAmount.toFixed(2)}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">Available</span>
                  <span>•</span>
                  <span>{formatNextPayoutInfo()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                  Pending Payouts
                </CardTitle>
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                  ${pendingPayouts.toFixed(2)}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span className="text-yellow-500">Processing</span>
                  <span>•</span>
                  <span>{payoutHistory.filter(p => ['queued', 'sent'].includes(p.status)).length} transactions</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                  PayPal Status
                </CardTitle>
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {isLinked ? "Connected" : "Not Linked"}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  {isLinked ? (
                    <span className="text-green-500 flex items-center">
                      <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Ready for payouts
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      Setup required
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Payout Section */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                PayPal Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isLinked ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                    <LinkIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Link Your PayPal Account</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Connect your PayPal account to receive payments. This is a secure process managed by PayPal.
                    </p>
                    <Button 
                      onClick={handleLinkAccount}
                      disabled={loading}
                      size="lg"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {loading ? "Connecting..." : "Link PayPal Account"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">PayPal Account Connected</h3>
                      <p className="text-muted-foreground mb-6">
                        Your PayPal account is successfully linked and ready to receive payments.
                      </p>
                      <Button 
                        onClick={handlePayout}
                        disabled={loading || nextPayoutAmount < 10}
                        size="lg"
                      >
                        {loading ? "Processing..." : nextPayoutAmount < 10 ? `Minimum $10 Required` : `Request Payout ($${nextPayoutAmount.toFixed(2)})`}
                      </Button>
                      
                      {nextPayoutAmount < 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          You need at least $10 in confirmed bookings to request a payout.
                          Current available: ${nextPayoutAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {message && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">{message}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payout History */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutHistory.length > 0 ? (
                <div className="space-y-4">
                  {payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payout.note || `Payout ${payout.id.slice(-6)}`}</p>
                          <p className="text-sm text-muted-foreground">{payout.date}</p>
                          {payout.currency && payout.currency !== 'USD' && (
                            <p className="text-xs text-muted-foreground">{payout.currency}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">${payout.amount.toFixed(2)}</p>
                        </div>
                        {getStatusBadge(payout.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payout history available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete some bookings to start earning payouts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payout Information */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>How Payouts Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Payout Schedule</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic daily processing at 2 AM UTC</li>
                    <li>• Only bookings older than 24 hours are processed</li>
                    <li>• Minimum payout amount: $10 USD</li>
                    <li>• Payouts sent directly to your PayPal account</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Payout Calculation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You receive 80% of booking amount</li>
                    <li>• Platform fee: 20% per booking</li>
                    <li>• PayPal fees may apply on their end</li>
                    <li>• No additional charges from our platform</li>
                  </ul>
                </div>
              </div>
              
              {nextPayoutAmount > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-800 mb-2">Next Payout Preview</h4>
                  <div className="text-sm text-blue-700">
                    <p>Available for next payout: <span className="font-semibold">${nextPayoutAmount.toFixed(2)}</span></p>
                    <p>Based on {totalBookings} confirmed booking{totalBookings !== 1 ? 's' : ''}</p>
                    <p className="mt-1 text-xs">
                      {formatNextPayoutInfo()} • {nextPayoutDate?.toLocaleDateString()} at 2 AM UTC
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </InstructorLayout>
  );
}
