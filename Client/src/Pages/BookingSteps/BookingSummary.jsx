import { format } from 'date-fns';
import { ClipboardCheck, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createSessionBooking } from '../../Api/booking.api';
import { getDeclarationsByAdventureId } from '../../Api/declaration.api';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';

export const BookingSummary = ({
  user,
  adventure,
  selectedInstructor,
  groupMembers,
  cartItems,
  mockItems,
  selectedHotel,
  mockHotels,
  calculateTotal,
  checkInDate,
  checkOutDate,
  calculateNights,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isBooking, setIsBooking] = useState(false);
  const [declaration, setDeclaration] = useState(null);
  const [showDeclaration, setShowDeclaration] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const date = params.get('session_date');

  const sessionDate = date
    ? new Date(date).toLocaleDateString()
    : 'Not specified';

  const fetchDeclaration = async () => {
    try {
      const declarations = await getDeclarationsByAdventureId(adventure._id);
      if (declarations.length > 0) {
        setDeclaration(declarations);
        setShowDeclaration(true);
      } else {
        toast.error('No declaration found for this adventure.');
      }
    } catch (error) {
      console.error('Error fetching declaration:', error);
      toast.error('Failed to fetch declaration.');
    }
  };

  const handleProceedToPayment = async (paymentMethod = 'revolut') => {
    if (!declaration) {
      await fetchDeclaration();
    } else {
      setShowDeclaration(true);
    }
    // Store payment method for use in proceedToPayment
    setSelectedPaymentMethod(paymentMethod);
  };

  // Add state to track selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('revolut');

  const handleUserConsent = (declId) => {
    // Here you can handle the user consent for the specific declaration
    // For example, you might want to send the declId to your backend to record the user's consent
    setShowDeclaration(false);
    proceedToPayment();
  };

  const proceedToPayment = async () => {
    if (isBooking) return;
    setIsBooking(true);

    const bookingId = toast.loading('Creating your booking...');

    try {
      if (!selectedInstructor) {
        toast.error('Please select an instructor for your adventure.', {
          id: bookingId,
        });
        setIsBooking(false);
        return;
      }

      let sessionBookingData = {};
      let itemBookingData = {};
      let hotelBookingData = {};

      // 1. Create Session Booking (for adventure/instructor)
      sessionBookingData = {
        session: selectedInstructor._id,
        groupMembers: groupMembers.map((member) => member._id),
        amount: (selectedInstructor.price || 0) + groupMembers.length * 30,
        modeOfPayment: selectedPaymentMethod,
      };

      // 2. Create Item Booking (for cart items) - Direct approach without cart
      if (cartItems.length > 0) {
        // Format items for direct booking API
        const formattedItems = cartItems.map((item) => ({
          item: item._id,
          quantity: item.quantity || 1,
          purchased: !item.rent,
          startDate: item.startDate || null,
          endDate: item.endDate || null,
        }));

        itemBookingData = {
          items: formattedItems,
        };
      }

      if (selectedHotel && (!checkInDate || !checkOutDate)) {
        toast.error(
          'Please select check-in and check-out dates for the hotel booking.',
          { id: bookingId }
        );
        setIsBooking(false);
        return;
      }

      // 3. Create Hotel Booking (for accommodation)
      if (selectedHotel && checkInDate && checkOutDate) {
        const hotel = mockHotels.find(
          (h) => h._id === selectedHotel || h.id === selectedHotel
        );
        const nights = calculateNights();

        hotelBookingData = {
          hotels: [
            {
              hotel: selectedHotel,
              checkInDate: checkInDate.toISOString(),
              checkOutDate: checkOutDate.toISOString(),
              nights: nights,
              pricePerNight: hotel?.pricePerNight || hotel?.price || 0,
            },
          ],
        };
      }

      const bookingData = {
        sessionBooking: sessionBookingData,
        itemBooking: itemBookingData,
        hotelBooking: selectedHotel ? hotelBookingData : null,
        totalAmount: calculateTotal(),
        modeOfPayment: selectedPaymentMethod,
      };

      const { data } = await createSessionBooking(bookingData);
      window.location = data.data.paymentUrl;
    } catch (error) {
      console.error('Error during booking:', error);
      toast.error('Failed to create booking.', { id: bookingId });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8 border border-white/50">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-800">
          {t('bookingSummary')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('yourProfile')}
            </h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md bg-gradient-to-r from-blue-600 to-cyan-500">
                <AvatarFallback>
                  {user?.user?.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-800">{user?.user?.email}</p>
                <p className="text-sm text-gray-500">
                  {t('adventureEnthusiast')}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('adventureDetails')}
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      adventure.medias?.[0] ||
                      adventure.images?.[0] ||
                      adventure.image ||
                      '/placeholder.svg'
                    }
                    alt={adventure?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{adventure?.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>
                      {adventure.location?.[0]?.name ||
                        adventure.location ||
                        'Location not specified'}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {sessionDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {selectedInstructor && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('yourInstructor')}
              </h3>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                  <AvatarImage
                    src={
                      selectedInstructor.instructorId?.profilePicture ||
                      selectedInstructor.img ||
                      selectedInstructor.image ||
                      selectedInstructor.avatar ||
                      '/placeholder.svg'
                    }
                    alt={
                      selectedInstructor.instructorId?.name ||
                      selectedInstructor?.name
                    }
                  />
                  <AvatarFallback>
                    {selectedInstructor?.instructorId?.name?.charAt(0) ||
                      selectedInstructor?.name?.charAt(0) ||
                      'I'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedInstructor.instructorId?.name ||
                      selectedInstructor?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedInstructor.instructorId?.instructor
                      ?.description?.[0] ||
                      selectedInstructor.specialty ||
                      selectedInstructor.specialization ||
                      selectedInstructor.expertise ||
                      'Professional Instructor'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-100">
                <span className="text-gray-600">{t('instructorFee')}</span>
                <span className="font-medium">
                  ${selectedInstructor.price || selectedInstructor.fee || 0}
                </span>
              </div>
              {groupMembers.length > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">
                    {t('additionalGroupFee')}
                  </span>
                  <span className="font-medium">
                    ${groupMembers.length * 30}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Group Members */}
          {groupMembers.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('yourGroup')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-md bg-gradient-to-r from-blue-600 to-cyan-500">
                    <AvatarFallback>
                      {user?.user?.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-800">
                      {user?.user?.email}
                    </p>
                    <p className="text-sm text-gray-500">{t('groupLeader')}</p>
                  </div>
                </div>

                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                      <AvatarImage
                        src={member.avatar || '/placeholder.svg'}
                        alt={member?.name}
                      />
                      <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {member?.name}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-100">
                  <span className="text-gray-600">{t('groupSize')}</span>
                  <span className="font-medium">
                    {groupMembers.length + 1} {t('people')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Items, Hotel, and Total */}
        <div>
          {/* Selected Items */}
          {cartItems.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('selectedItems')}
              </h3>
              <div className="space-y-3">
                {cartItems.map((cartItem) => {
                  const item = mockItems.find((i) => i._id === cartItem._id);
                  const price = cartItem.rent ? item?.price : item?.price;
                  return (
                    <div
                      key={`${cartItem._id}-${cartItem.rent ? 'rent' : 'buy'}`}
                      className="flex items-start gap-3"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item?.images?.[0] || '/placeholder.svg'}
                          alt={item?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item?.name}{' '}
                          {cartItem.rent && (
                            <span className="text-xs text-green-600">
                              ({t('rental')})
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('qty')}: {cartItem.quantity}
                        </p>
                      </div>
                      <div className="font-medium text-blue-600">
                        ${((price || 0) * cartItem.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                  <span className="text-gray-600">{t('itemsTotal')}</span>
                  <span className="font-medium">
                    $
                    {cartItems
                      .reduce((sum, cartItem) => {
                        const itemData = mockItems.find(
                          (i) => i._id === cartItem._id
                        );
                        const price = cartItem.rent
                          ? itemData?.price
                          : itemData?.price;
                        const quantity = cartItem.quantity || 1;
                        return sum + (price || 0) * quantity;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Hotel */}
          {selectedHotel && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('selectedAccommodation')}
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.medias?.[0] ||
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.logo ||
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.images?.[0] ||
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.img ||
                      '/placeholder.svg'
                    }
                    alt={
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.name
                    }
                    className="w-full h-full object-cover"
                  />
                </div>{' '}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.name
                    }
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>
                      {mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.location?.name ||
                        mockHotels.find(
                          (h) =>
                            h._id === selectedHotel || h.id === selectedHotel
                        )?.location ||
                        'Location not specified'}
                    </span>
                  </div>
                  {checkInDate && checkOutDate && (
                    <div className="text-sm text-gray-600 mt-1">
                      <p>
                        Check-in:{' '}
                        {checkInDate instanceof Date
                          ? format(checkInDate, 'MMM dd, yyyy')
                          : 'Invalid date'}
                      </p>
                      <p>
                        Check-out:{' '}
                        {checkOutDate instanceof Date
                          ? format(checkOutDate, 'MMM dd, yyyy')
                          : 'Invalid date'}
                      </p>
                      <p className="font-medium">
                        {calculateNights()}{' '}
                        {calculateNights() === 1 ? 'night' : 'nights'}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= (mockHotels.find((h) => h._id === selectedHotel || h.id === selectedHotel)?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs ml-1 text-gray-500">
                      {
                        mockHotels.find(
                          (h) =>
                            h._id === selectedHotel || h.id === selectedHotel
                        )?.rating
                      }
                    </span>
                  </div>
                </div>
                <div className="font-medium text-blue-600 text-right">
                  <div>
                    $
                    {(mockHotels.find(
                      (h) => h._id === selectedHotel || h.id === selectedHotel
                    )?.pricePerNight ||
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.price ||
                      0) * calculateNights()}
                    <span className="text-xs font-normal text-gray-500 block">
                      total
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    $
                    {mockHotels.find(
                      (h) => h._id === selectedHotel || h.id === selectedHotel
                    )?.pricePerNight ||
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.price ||
                      0}
                    /night
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">
              {t('paymentSummary')}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span>{t('adventure')}</span>
                <span>{t('included')}</span>
              </div>
              {selectedInstructor && (
                <div className="flex justify-between items-center">
                  <span>{t('instructorPrice')}</span>
                  <span>
                    ${selectedInstructor.price || selectedInstructor.fee || 0}
                  </span>
                </div>
              )}
              {cartItems.length > 0 && (
                <div className="flex justify-between items-center">
                  <span>
                    {t('items')} (
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <span>
                    $
                    {cartItems
                      .reduce((sum, cartItem) => {
                        const itemData = mockItems.find(
                          (i) => i._id === cartItem._id
                        );
                        const price = cartItem.rent
                          ? itemData?.price
                          : itemData?.price;
                        return sum + (price || 0) * cartItem.quantity;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}{' '}
              {selectedHotel && (
                <div className="flex justify-between items-center">
                  <span>
                    {t('hotel')}{' '}
                    {checkInDate &&
                      checkOutDate &&
                      `(${calculateNights()} ${calculateNights() === 1 ? 'night' : 'nights'})`}
                  </span>
                  <span>
                    $
                    {(mockHotels.find(
                      (h) => h._id === selectedHotel || h.id === selectedHotel
                    )?.pricePerNight ||
                      mockHotels.find(
                        (h) => h._id === selectedHotel || h.id === selectedHotel
                      )?.price ||
                      0) * calculateNights()}
                  </span>
                </div>
              )}
              {selectedInstructor && groupMembers.length > 0 && (
                <div className="flex justify-between items-center">
                  <span>
                    {t('Group Fee')} ({groupMembers.length + 1} {t('Members')})
                  </span>
                  <span>
                    $
                    {(selectedInstructor.price || selectedInstructor.fee || 0) +
                      groupMembers.length * 30}
                  </span>
                </div>
              )}
              {selectedInstructor && (
                <div className="flex justify-between items-center">
                  <span>{t('Platform Fee')}</span>
                  <span>${(calculateTotal() * 0.12).toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="bg-white/20 my-4" />

            <div className="flex justify-between items-center text-xl font-bold">
              <span>{t('total')}</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <Button
              onClick={() => {
                setSelectedPaymentMethod('revolut');
                handleProceedToPayment('revolut');
              }}
              disabled={isBooking}
              className="w-full mt-6 bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {isBooking && selectedPaymentMethod === 'revolut'
                ? 'Creating Booking...'
                : t('proceedToPayment')}
            </Button>
            <Button
              onClick={() => {
                setSelectedPaymentMethod('paypal');
                handleProceedToPayment('paypal');
              }}
              disabled={isBooking}
              className="w-full mt-2 bg-yellow-400 text-gray-800 hover:bg-yellow-300 disabled:opacity-50"
            >
              {isBooking && selectedPaymentMethod === 'paypal'
                ? 'Processing PayPal...'
                : 'Pay with PayPal'}
            </Button>
          </div>
        </div>
      </div>

      {showDeclaration && declaration && declaration.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 lg:w-1/2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t('Declaration')}
            </h2>
            <div className="text-gray-600 mb-6 overflow-y-auto max-h-60">
              <p>{declaration[0].content}</p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleUserConsent(declaration[0]._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('I Agree')}
              </button>
              <button
                onClick={() => setShowDeclaration(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
