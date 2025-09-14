'use client';

import { motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

export const AdventureCard = ({ adventure, formatDate, onBook }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoClick = (e) => {
    e.stopPropagation();
    setIsVideoPlaying(true);
  };

  const handleCloseVideo = (e) => {
    e.stopPropagation();
    setIsVideoPlaying(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 sm:h-52 md:h-48 lg:h-52 xl:h-56 overflow-hidden">
        {/* Thumbnail Image */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ x: 0 }}
          animate={{
            x: isVideoPlaying ? '-100%' : '0%',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.5,
          }}
        >
          {adventure?.medias?.[0] ? (
            <img
              src={adventure?.medias?.[0] || '/placeholder.svg'}
              alt={adventure?.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-medium text-center px-4">
                {adventure?.name}
              </span>
            </div>
          )}
          {adventure?.previewVideo && !isVideoPlaying && (
            <motion.button
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-1 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVideoClick}
              aria-label="Play preview video"
            >
              <ChevronRight size={15} className="text-blue-600 ml-0.5" />
            </motion.button>
          )}
        </motion.div>

        {/* Video Player */}
        {adventure?.previewVideo && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ x: '100%' }}
            animate={{
              x: isVideoPlaying ? '0%' : '100%',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
          >
            <div className="relative w-full h-full">
              <video
                src={adventure?.previewVideo}
                autoPlay
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
                style={{ outline: 'none' }}
                playsInline
                muted={false}
              />
              <motion.button
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black/90 transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCloseVideo}
                aria-label="Close video"
              >
                <X size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
          {adventure?.name}
        </h3>

        <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2">
          {adventure?.location && adventure?.location.length > 0 && (
            <span>{adventure?.location[0]?.name}</span>
          )}
        </div>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-3 flex-1">
          {adventure?.description}
        </p>

        <div className="mt-auto space-y-2">
          {adventure?.session_date && (
            <div className="text-xs text-gray-500">
              Available: {formatDate(adventure?.session_date)}
            </div>
          )}

          <motion.button
            className="w-full py-2 sm:py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md font-medium text-sm sm:text-base transition-all hover:from-blue-600 hover:to-indigo-700"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => onBook(adventure?._id)}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AdventureCard;
