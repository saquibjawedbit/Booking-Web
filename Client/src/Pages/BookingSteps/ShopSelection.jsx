'use client';

import { motion } from 'framer-motion';
import { Calendar, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '../../assets/Animations';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import DateRangePicker from '../../components/ui/DateRangePicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export const ShopSelection = ({
  mockItems,
  cartItems,
  handleAddToCart,
  handleRemoveFromCart,
}) => {
  const { t } = useTranslation();
  const [selectedRentalItem, setSelectedRentalItem] = useState(null);
  const [rentalStartDate, setRentalStartDate] = useState(null);
  const [rentalEndDate, setRentalEndDate] = useState(null);
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);

  const handleRentalClick = (item) => {
    setSelectedRentalItem(item);
    setRentalStartDate(null);
    setRentalEndDate(null);
    setIsRentalDialogOpen(true);
  };

  const handleRentalDateConfirm = () => {
    if (!rentalStartDate || !rentalEndDate) {
      toast.error('Please select both start and end dates for rental');
      return;
    }

    if (rentalStartDate >= rentalEndDate) {
      toast.error('End date must be after start date');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (rentalStartDate < today) {
      toast.error('Start date cannot be in the past');
      return;
    }

    // Add rental item with dates to cart
    handleAddToCart(selectedRentalItem._id, true, {
      startDate: rentalStartDate,
      endDate: rentalEndDate,
    });

    setIsRentalDialogOpen(false);
    setSelectedRentalItem(null);
    setRentalStartDate(null);
    setRentalEndDate(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-xl mb-8 border border-blue-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('shopItems')}
        </h2>
        <p className="text-blue-600 font-medium bg-blue-100 px-4 py-2 rounded-full inline-block">
          🎒 Recommended items to have before continuing to your adventure
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockItems.map((item) => {
          const rentCartItem = cartItems.find(
            (ci) => ci._id === item._id && ci.rent
          );
          const isInCart = rentCartItem && rentCartItem.quantity > 0;
          return (
            <motion.div key={item._id} variants={itemVariants}>
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white border-2 border-transparent hover:border-blue-200">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.images[0] || '/placeholder.svg'}
                    alt={item?.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    For Rent
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
                    {item?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(item.totalReviews || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm ml-2 text-gray-600">
                      ({item.totalReviews})
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        ${item.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/day</span>
                    </div>
                    <div className="flex gap-2">
                      {isInCart ? (
                        <Button
                          variant="outline"
                          className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          onClick={() => handleRentalClick(item)}
                        >
                          <Calendar size={16} className="mr-2" />
                          Update Dates
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleRentalClick(item)}
                        >
                          <Calendar size={16} className="mr-2" />
                          Rent Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <motion.div
          className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🛒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              {t('yourCart')}
            </h3>
          </div>
          <div className="space-y-4">
            {' '}
            {cartItems.map((cartItem) => {
              const item = mockItems.find((i) => i._id === cartItem._id);
              let price = cartItem.rent ? item?.price : item?.price;
              let totalPrice = (price || 0) * cartItem.quantity;

              // Calculate rental pricing based on dates
              if (cartItem.rent && cartItem.startDate && cartItem.endDate) {
                const days = Math.ceil(
                  (new Date(cartItem.endDate) - new Date(cartItem.startDate)) /
                    (1000 * 60 * 60 * 24)
                );
                totalPrice = (price || 0) * days * cartItem.quantity;
              }

              return (
                <div
                  key={`${cartItem._id}-${cartItem.rent}`}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={item?.images[0] || '/placeholder.svg'}
                        alt={item?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {item?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Rental
                        </span>
                        <span className="text-sm text-gray-600">
                          Qty: {cartItem.quantity}
                        </span>
                      </div>
                      {cartItem.rent &&
                        cartItem.startDate &&
                        cartItem.endDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            📅{' '}
                            {new Date(cartItem.startDate).toLocaleDateString()}{' '}
                            - {new Date(cartItem.endDate).toLocaleDateString()}
                            <span className="font-medium text-blue-600 ml-2">
                              (
                              {Math.ceil(
                                (new Date(cartItem.endDate) -
                                  new Date(cartItem.startDate)) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              days)
                            </span>
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      ${totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">${price}/day</div>
                  </div>
                </div>
              );
            })}{' '}
            <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">
                {t('cartTotal')}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                $
                {cartItems
                  .reduce((sum, cartItem) => {
                    const itemData = mockItems.find(
                      (i) => i._id === cartItem._id
                    );
                    const price = cartItem.rent
                      ? itemData?.price
                      : itemData?.price;
                    let itemTotal = (price || 0) * cartItem.quantity;

                    // Calculate rental pricing based on dates
                    if (
                      cartItem.rent &&
                      cartItem.startDate &&
                      cartItem.endDate
                    ) {
                      const days = Math.ceil(
                        (new Date(cartItem.endDate) -
                          new Date(cartItem.startDate)) /
                          (1000 * 60 * 60 * 24)
                      );
                      itemTotal = (price || 0) * days * cartItem.quantity;
                    }

                    return sum + itemTotal;
                  }, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>{' '}
        </motion.div>
      )}

      {/* Rental Date Selection Dialog */}
      <Dialog open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
              Select Rental Period
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {selectedRentalItem && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <img
                  src={selectedRentalItem.images[0] || '/placeholder.svg'}
                  alt={selectedRentalItem?.name}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    {selectedRentalItem?.name}
                  </h4>
                  <p className="text-blue-600 font-bold text-lg">
                    ${selectedRentalItem.price}/day
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">
                Choose your rental dates:
              </label>
              <DateRangePicker
                startDate={rentalStartDate}
                endDate={rentalEndDate}
                onChange={(startDate, endDate) => {
                  setRentalStartDate(startDate);
                  setRentalEndDate(endDate);
                }}
              />
            </div>

            {rentalStartDate && rentalEndDate && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-gray-800 mb-3">
                  Rental Summary
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {Math.ceil(
                        (rentalEndDate - rentalStartDate) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-semibold">
                      ${selectedRentalItem?.price || 0}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Total Cost:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      $
                      {(
                        (selectedRentalItem?.price || 0) *
                        Math.ceil(
                          (rentalEndDate - rentalStartDate) /
                            (1000 * 60 * 60 * 24)
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                className="px-6"
                onClick={() => setIsRentalDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="px-6 bg-blue-600 hover:bg-blue-700"
                onClick={handleRentalDateConfirm}
                disabled={!rentalStartDate || !rentalEndDate}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
