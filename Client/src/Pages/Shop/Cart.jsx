import { motion } from "framer-motion"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard, Package, MapPin, Star, Calendar, User } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import DateRangePicker from "../../components/ui/DateRangePicker"
import useCart from '../../hooks/useCart';
import { Link, useNavigate } from "react-router-dom"
import { Navbar } from "../../components/Navbar"
import { useState, useMemo, useContext,useEffect } from "react"
import { toast } from "sonner"
import { createBooking } from "../../Api/booking.api";
import { CartContext } from "../Cart/CartContext"

export const Cart = () => {
    const navigate = useNavigate()
    const [cart, setCart] = useState(null)
    const {  totalPrice, loading, error, updateCartItem, removeCartItem, clearCart } = useCart()
    const [loadingItems, setLoadingItems] = useState({})
    const [name, setName] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isBookingLoading, setIsBookingLoading] = useState(false)
    console.log(cart);
    const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/cart", {
        credentials: "include",
      });
      const data = await res.json();
      setCart(data.data.cart);

      console.log("Full Cart Data:", data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart(); // Call once on mount
  }, []);


    const handleQuantityUpdate = async (itemId, newQuantity, purchase) => {
        if (newQuantity < 1) return
        setLoadingItems(prev => ({ ...prev, [itemId]: true }))
        try {
            await updateCartItem({ itemId, quantity: newQuantity, purchase })
            toast.success("Cart updated successfully")
        } catch (err) {
            toast.error("Failed to update cart")
        } finally {
            setLoadingItems(prev => ({ ...prev, [itemId]: false }))
        }
    }

    const handleRemoveItem = async (cartItemId, purchase = false) => {
  setLoadingItems(prev => ({ ...prev, [cartItemId]: true }));
  try {
    await removeCartItem({ itemId: cartItemId, purchase });
    toast.success("Item removed from cart");
    fetchCart();
  } catch (err) {
    console.error(err.response?.data || err.message);
    toast.error("Failed to remove item");
  } finally {
    setLoadingItems(prev => ({ ...prev, [cartItemId]: false }));
  }
};

    const handleClearCart = async () => {
        try {
            await clearCart()
            toast.success("Cart cleared successfully")
        } catch (err) {
            toast.error("Failed to clear cart")
        }
    }

    const handleRentalDateChange = async (itemId, startDate, endDate) => {
        if (!startDate || !endDate) return

        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        const rentalPeriod = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days
        }

        setLoadingItems(prev => ({ ...prev, [itemId]: true }))
        try {
            await updateCartItem({ itemId, rentalPeriod })
            toast.success("Rental period updated successfully")
        } catch (err) {
            toast.error("Failed to update rental period")
        } finally {
            setLoadingItems(prev => ({ ...prev, [itemId]: false }))
        }
    }

    const getItemPrice = (item) => {
        if (item.rentalPeriod) {
            return item.item?.rentalPrice || 0
        }
        return item.item?.price || 0
    }

    const getItemTotal = (item) => {
        if (item.rentalPeriod) {
            return getItemPrice(item) * item.rentalPeriod.days * item.quantity
        }
        return getItemPrice(item) * item.quantity
    }

    // Calculate total cost with tax using useMemo
    const calculatedTotalWithTax = useMemo(() => {
        if (!cart?.items || cart.items.length === 0) return 0

        const subtotal = cart.items.reduce((sum, item) => {
            return sum + getItemTotal(item)
        }, 0)

        const tax = totalPrice - subtotal
        return subtotal + tax
    }, [cart?.items])

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",                day: "numeric",
                year: "numeric"
            })
        } catch (error) {
            return "Invalid date"
        }
    }

    const handleBooking = async (modeOfPayment) => {
        if (!name.trim()) {
            toast.error("Please enter your name")
            return
        }

        setIsBookingLoading(true)
        const id = toast.loading("Creating Booking....")
        try {
            const res = await createBooking(name, modeOfPayment)
            toast.success("Booking created successfully", { id })
            setIsDialogOpen(false)
            setName("")
            
 
            window.location.href = res.data.data.paymentOrder.checkout_url; // Navigate to success page or home
        } catch (e) {
            // Check if it's a 401 error (unauthorized)
            if (e.response?.status === 401) {
                toast.error("Please enter the registered name", { id })
            } else {
                toast.error(`Booking Failed: ${e.response?.data?.message || e.message || e}`, { id })
            }
        } finally {
            setIsBookingLoading(false)
        }
    }

    const handleCheckoutClick = () => {
        if (!cart?.items || cart.items.length === 0) {
            toast.error("Your cart is empty")
            return
        }
        setIsDialogOpen(true)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white ">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                        <p className="text-gray-700">Loading cart...</p>
                    </div>
                </div>
            </div>
        )
    }
console.log("Cart.jsx cart state:", cart);
    return (
        <div className="min-h-screen bg-white mt-20">
            <Navbar />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 py-8"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="mb-6 border-red-600 bg-gray-100">
                        <CardContent className="p-6 text-center">
                            <div className="text-black mb-4">
                                <Package className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-black mb-2">Error Loading Cart</h3>
                            <p className="text-gray-700">{error.message || "Failed to load cart"}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty Cart */}
                {!cart?.items || cart.items.length === 0 ? (
                    <Card className="text-center py-12 border-gray-300">
                        <CardContent>
                            <div className="text-gray-500 mb-4">
                                <ShoppingBag className="h-16 w-16 mx-auto" />
                            </div>
                            <h2 className="text-xl font-semibold text-black mb-2">Your cart is empty</h2>
                            <p className="text-gray-600 mb-6">Add some awesome adventure gear to get started!</p>
                            <Link to="/shop">
                                <Button className="bg-black hover:bg-gray-800 text-white">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    /* Cart Content */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-black">Cart Items ({cart.items.length})</h2>
                                {cart.items.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearCart}
                                        className="text-black border-black hover:text-white hover:bg-black"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear Cart
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="overflow-hidden border-gray-300">
                                            <CardContent className="p-0">
                                                <div className="flex">
                                                    {/* Product Image */}
                                                    <div className="w-32 h-32 relative">
                                                        <img
                                                            src={item.item?.images?.[0] || "/placeholder.svg"}
                                                            alt={item.item?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {item.item?.category}
                                                                    </Badge>
                                                                    {item.rentalPeriod && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Rental
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <h3 className="font-semibold text-lg mb-1">
                                                                    {item.item?.name}
                                                                </h3>

                                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                    {item.item?.description}
                                                                </p>                                                {/* Price and Rental Info */}
                                                                <div className="flex items-center gap-4 mb-3">
                                                                    <div className="text-lg font-bold text-blue-600">
                                                                        €{getItemPrice(item).toFixed(2)}
                                                                        {item.rentalPeriod && (
                                                                            <span className="text-sm font-normal text-gray-500">
                                                                                /day
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.rentalPeriod && (
                                                                        <div className="text-sm text-gray-600">
                                                                            {item.rentalPeriod.days} days
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Rental Date Picker - Only show for rental items */}
                                                                {item.rentalPeriod && (
                                                                    <div className="mb-3">
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                            Rental Period
                                                                        </label>
                                                                        <div className="flex items-center gap-2">
                                                                            <DateRangePicker
                                                                                startDate={item.rentalPeriod.startDate ? new Date(item.rentalPeriod.startDate) : null}
                                                                                endDate={item.rentalPeriod.endDate ? new Date(item.rentalPeriod.endDate) : null}
                                                                                onChange={(startDate, endDate) => handleRentalDateChange(item.item._id, startDate, endDate, item.purchase)}
                                                                                className="flex-1"
                                                                            />
                                                                            <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                                                <Calendar className="h-3 w-3" />
                                                                                <span>{item.rentalPeriod.days} days</span>
                                                                            </div>
                                                                        </div>
                                                                        {item.rentalPeriod.startDate && item.rentalPeriod.endDate && (
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {formatDate(item.rentalPeriod.startDate)} - {formatDate(item.rentalPeriod.endDate)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Quantity Controls */}
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm font-medium">Quantity:</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleQuantityUpdate(item.item._id, item.quantity - 1, item.purchase)}
                                                                            disabled={item.quantity <= 1 || loadingItems[item.item._id]}
                                                                            className="h-8 w-8 p-0 border-black text-black hover:bg-black hover:text-white"
                                                                        >
                                                                            <Minus className="h-3 w-3" />
                                                                        </Button>
                                                                        <span className="w-12 text-center font-medium">
                                                                            {item.quantity}
                                                                        </span>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleQuantityUpdate(item.item._id, item.quantity + 1, item.purchase)}
                                                                            disabled={loadingItems[item.item._id]}
                                                                            className="h-8 w-8 p-0 border-black text-black hover:bg-black hover:text-white"
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Item Total and Remove */}
                                                            <div className="text-right">
                                                                <div className="text-xl font-bold mb-2">
                                                                    €{getItemTotal(item).toFixed(2)}
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(item.item._id)}
                                                                    disabled={loadingItems[item.item._id]}
                                                                    className="text-black hover:text-white hover:bg-black"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Continue Shopping */}
                            <div className="pt-4">
                                <Link to="/shop">
                                    <Button variant="outline" className="w-full sm:w-auto border-black text-black hover:bg-black hover:text-white">
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column - Checkout Summary */}
                        <div className="lg:col-span-1 ">
                            <div className="sticky top-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Order Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Item Summary */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Items ({cart.items.length})</span>
                                                <span>€{cart.items.reduce((sum, item) => sum + getItemTotal(item), 0).toFixed(2)}</span>
                                            </div>
                                            {/* <div className="flex justify-between text-sm">
                                                <span>Shipping</span>
                                                <span className="text-green-600">Free</span>
                                            </div> */}
                                            <div className="flex justify-between text-sm">
                                                <span>Platform Fee</span>
                                                <span>€{(cart.items.reduce((sum, item) => sum + getItemTotal(item), 0) * 0.12).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Total */}
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>€{totalPrice.toFixed(2)}</span>
                                        </div>                                        {/* Checkout Button */}
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                                    size="lg"
                                                    onClick={handleCheckoutClick}
                                                >
                                                    Proceed to Checkout
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <User className="h-5 w-5" />
                                                        Complete Your Booking
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Please enter your name to proceed with the booking.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <label htmlFor="name" className="text-right font-medium">
                                                            Name
                                                        </label>
                                                        <Input
                                                            id="name"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="Enter your full name"
                                                            className="col-span-3"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <span className="text-right text-sm text-gray-600">Total:</span>
                                                        <span className="col-span-3 font-bold text-lg">€{totalPrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsDialogOpen(false)}
                                                        disabled={isBookingLoading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleBooking("paypal")} 
                                                        disabled={isBookingLoading || !name.trim()}
                                                        className="bg-black hover:bg-gray-800 text-white"
                                                    >
                                                        {isBookingLoading ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            "Pay with PayPal"
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleBooking("revolut")} 
                                                        disabled={isBookingLoading || !name.trim()}
                                                        className="bg-black hover:bg-gray-800 text-white"
                                                    >
                                                        {isBookingLoading ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            "Pay with Revolut"
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <p className="text-xs text-gray-500 text-center">
                                            Secure checkout powered by Paypal & Revoult
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
