'use client';

import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeftIcon,
  Hotel as HotelIcon,
  MapPin,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchLocations } from '../../Api/location.api';
import { Navbar } from '../../components/Navbar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { useHotels } from '../../hooks/useHotel';

export default function HotelBrowsingPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract filters from URL params or set defaults
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    status: '', // Only show approved hotels
    page: parseInt(searchParams.get('page') || '1'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const [locations, setLocations] = useState([]);
  const [limit] = useState(12);

  // Use the hotel hook with current filters
  const { hotels, isLoading, error, total, totalPages } = useHotels({
    page: filters.page,
    limit,
    status: filters.status,
    location: filters.location || null,
    minPrice: filters.minPrice || null,
    maxPrice: filters.maxPrice || null,
    minRating: filters.minRating || null,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  // Fetch locations for filter dropdown
  useEffect(() => {
    const getLocations = async () => {
      try {
        const res = await fetchLocations();
        setLocations(res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    getLocations();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        newParams.set(key, value.toString());
      }
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // Handle filter changes
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      status: '',
      page: 1,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Hotels
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error loading the hotels. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

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
          <Link
            className="flex items-center text-gray-600 hover:text-gray-900"
            to="/"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <HotelIcon className="h-8 w-8 text-blue-600" />
              Browse Hotels
            </h1>
            <p className="text-gray-600 mt-1">
              {total > 0 ? `Found ${total} hotels` : 'No hotels found'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Location Filter */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.location || 'All Locations'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuItem
                    onClick={() => updateFilter('location', '')}
                  >
                    All Locations
                  </DropdownMenuItem>
                  {locations.map((location) => (
                    <DropdownMenuItem
                      key={location._id}
                      onClick={() => updateFilter('location', location?.name)}
                    >
                      {location?.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Price Range */}
            <div>
              <Input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>

            {/* Rating Filter */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {filters.minRating
                      ? `${filters.minRating}+ Stars`
                      : 'All Ratings'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => updateFilter('minRating', '')}
                  >
                    All Ratings
                  </DropdownMenuItem>
                  {[4, 3, 2, 1].map((rating) => (
                    <DropdownMenuItem
                      key={rating}
                      onClick={() =>
                        updateFilter('minRating', rating.toString())
                      }
                    >
                      {rating}+ Stars
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.location ||
            filters.minPrice ||
            filters.maxPrice ||
            filters.minRating) && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Hotels Grid */}
        {!isLoading && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <motion.div
                key={hotel._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group">
                  {/* Hotel Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={
                        hotel.logo || hotel.medias?.[0] || '/placeholder.svg'
                      }
                      alt={hotel?.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          hotel.verified === 'approved'
                            ? 'success'
                            : 'secondary'
                        }
                        className="bg-white/90 text-black"
                      >
                        {hotel.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {hotel?.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {hotel.rating || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {hotel.location?.name || 'Location not specified'}
                      </span>
                    </div>

                    {hotel.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {hotel.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">
                          ${hotel.pricePerNight || hotel.price || 0}
                          <span className="text-sm font-normal text-gray-500">
                            /night
                          </span>
                        </span>
                        {hotel.noRoom && (
                          <span className="text-xs text-gray-500">
                            {hotel.noRoom} rooms available
                          </span>
                        )}
                      </div>{' '}
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          navigate('/hotel/checkout', {
                            state: {
                              hotel,
                              checkInDate: new Date()
                                .toISOString()
                                .split('T')[0],
                              checkOutDate: new Date(Date.now() + 86400000)
                                .toISOString()
                                .split('T')[0],
                              rooms: 1,
                              guests: { adults: 1, children: 0 },
                            },
                          });
                        }}
                      >
                        Book Now
                      </Button>
                    </div>

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {hotel.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hotel.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && hotels.length === 0 && (
          <div className="text-center py-12">
            <HotelIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Hotels Found
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.location ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.minRating
                ? 'Try adjusting your filters to see more results.'
                : 'No hotels are currently available.'}
            </p>
            {(filters.location ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.minRating) && (
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && hotels.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrentPage = pageNum === filters.page;

              // Show first page, last page, current page, and pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
              ) {
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }

              // Show ellipsis
              if (
                pageNum === filters.page - 2 ||
                pageNum === filters.page + 2
              ) {
                return (
                  <span key={pageNum} className="px-2">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
