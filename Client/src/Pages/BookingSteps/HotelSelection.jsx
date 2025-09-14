'use client';

import { motion } from 'framer-motion';
import { Building, Calendar, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import DateRangePicker from '../../components/ui/DateRangePicker';
import { cn } from '../../lib/utils';

export const HotelSelection = ({
  hotels,
  selectedHotel,
  onSelectHotel,
  checkInDate,
  checkOutDate,
  onDateChange,
  calculateNights,
}) => {
  const { t } = useTranslation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="bg-black/5 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {' '}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building className="w-6 h-6" /> {t('selectAccommodation')}
        </h2>
      </div>
      {/* Date Range Picker */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> {t('selectDates')}
        </h3>
        <DateRangePicker
          startDate={checkInDate}
          endDate={checkOutDate}
          onChange={onDateChange}
          className="max-w-md"
        />
        {checkInDate && checkOutDate && (
          <p className="text-sm text-gray-600 mt-2">
            {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}{' '}
            selected
          </p>
        )}
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {hotels?.map((hotel) => (
          <motion.div key={hotel?._id} variants={itemVariants}>
            <Card
              className={cn(
                'overflow-hidden h-full transition-all duration-300 cursor-pointer border-2',
                selectedHotel === hotel?._id
                  ? 'border-blue-500 shadow-md shadow-blue-200'
                  : 'border-transparent hover:border-blue-200'
              )}
              onClick={() =>
                onSelectHotel(hotel?._id === selectedHotel ? null : hotel?._id)
              }
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 h-full">
                  <img
                    src={hotel?.medias || '/placeholder.svg'}
                    alt={hotel?.name}
                    className="w-full h-full object-cover md:h-48"
                  />
                </div>
                <div className="md:w-3/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <MapPin size={14} />
                    <span>{hotel?.location?.name || hotel?.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {hotel?.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-xs ml-1 text-gray-500">
                      {hotel?.rating}
                    </span>
                  </div>{' '}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-600">
                        $
                        {(hotel.pricePerNight || hotel?.price) *
                          calculateNights()}
                        {calculateNights() > 1 && (
                          <span className="text-sm font-normal text-gray-500">
                            {' '}
                            total
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        ${hotel?.pricePerNight || hotel?.price}/night ×{' '}
                        {calculateNights()}{' '}
                        {calculateNights() === 1 ? 'night' : 'nights'}
                      </span>
                    </div>
                    <Badge
                      variant={
                        selectedHotel === hotel?._id ? 'default' : 'outline'
                      }
                      className={
                        selectedHotel === hotel?._id ? 'bg-blue-600' : ''
                      }
                    >
                      {selectedHotel === hotel?._id
                        ? t('selected')
                        : t('select')}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
