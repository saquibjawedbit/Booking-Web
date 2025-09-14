'use client';
import { motion } from 'framer-motion';
import { Calendar, LogOut, Settings, TicketIcon, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const UserProfileDropdown = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // User level calculation based on bookings or points
  const getUserLevel = () => {
    const bookingsCount = user?.bookings?.length || 0;

    if (bookingsCount >= 20) return 'Diamond';
    if (bookingsCount >= 10) return 'Platinum';
    if (bookingsCount >= 5) return 'Gold';
    if (bookingsCount >= 2) return 'Silver';
    return 'Bronze';
  };

  const getLevelColor = () => {
    const level = getUserLevel();
    switch (level) {
      case 'Diamond':
        return 'bg-gradient-to-r from-blue-400 to-purple-500';
      case 'Platinum':
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-300 to-yellow-500';
      case 'Silver':
        return 'bg-gradient-to-r from-gray-200 to-gray-400';
      default:
        return 'bg-gradient-to-r from-amber-700 to-amber-900';
    }
  };

  const getInitials = (name) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Avatar className="h-10 w-10 border-2 border-blue-500 cursor-pointer">
            {user?.profileImage ? (
              <AvatarImage
                src={user?.profileImage || '/placeholder.svg'}
                alt={user?.name || 'User'}
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium">
                {getInitials(user?.name)}
              </AvatarFallback>
            )}
          </Avatar>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-bold">{user?.name || user?.email}</span>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500">{t('level')}: </span>
            <Badge className={`ml-1 ${getLevelColor()} text-white`}>
              {getUserLevel()}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getLevelColor()} h-2 rounded-full`}
              style={{
                width: `${Math.min((user?.bookings?.length || 0) * 5, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer"
        >
          <User className="w-4 h-4 mr-2" />
          {t('profile')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/dashboard/bookings')}
          className="cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t('myBookings')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/dashboard/tickets')}
          className="cursor-pointer"
        >
          <TicketIcon className="w-4 h-4 mr-2" />
          {t('tickets')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/dashboard/settings')}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          {t('settings')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
