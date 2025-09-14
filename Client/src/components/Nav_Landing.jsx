'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings, TicketIcon, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosLogIn } from 'react-icons/io';
import { MdClose, MdLanguage, MdMenu } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { updateLanguageHeaders } from '../Api/language.api.js';
import { userLogout } from '../Auth/UserAuth.js';
import { useAuth } from '../Pages/AuthProvider';
import { Loader } from '../components/Loader';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import LanguageSelector from './LanguageSelector';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Nav_Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isShopEnabled, isHotelsEnabled } = useWebsiteSettings();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogout = async () => {
    await userLogout(dispatch)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        toast.error(t('logoutError'));
      });
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    updateLanguageHeaders(code);
    try {
      localStorage.setItem('selectedLanguage', code);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const navigateprofile = () => {
    if (user.user.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else if (user.user.role === 'hotel') {
      navigate('/hotel');
    } else if (user.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <nav className="w-full fixed h-fit z-50 px-2 sm:px-4">
      <motion.div
        className="bg-black/70 backdrop-blur-md w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] m-auto mt-2 sm:mt-3 md:mt-5 text-white px-2 sm:px-3 py-2 sm:py-3 rounded-xl border border-white/10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1
            className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            Adventure
          </motion.h1>

          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-1 sm:p-2"
            >
              {mobileMenuOpen ? (
                <MdClose className="text-xl sm:text-2xl" />
              ) : (
                <MdMenu className="text-xl sm:text-2xl" />
              )}
            </button>
          </div>
          <div className="hidden lg:flex links gap-5 xl:gap-10 items-center">
            <ul className="flex space-x-3 xl:space-x-5 items-center text-base xl:text-lg">
              <motion.li
                className="cursor-pointer hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('explore')}
              </motion.li>
              {isShopEnabled && (
                <motion.li
                  className="cursor-pointer hover:text-emerald-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/shop">{t('shop')}</Link>
                </motion.li>
              )}
              {isHotelsEnabled && (
                <motion.li
                  className="cursor-pointer hover:text-emerald-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a href="/book-hotel">{t('hotels')}</a>
                </motion.li>
              )}
              <motion.li
                className="cursor-pointer hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('mission')}
              </motion.li>
              <motion.li className="cursor-pointer hover:text-emerald-400 transition-colors">
                <LanguageSelector />
              </motion.li>
              <li>
                {loading ? (
                  <Loader />
                ) : user.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-0"
                      >
                        {' '}
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-black">
                          <AvatarFallback>
                            {user?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => navigateprofile()}>
                          <User className="mr-2 h-4 w-4" />
                          <span>{t('profile')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/dashboard/tickets')}
                        >
                          <TicketIcon className="mr-2 h-4 w-4" />
                          <span>{t('tickets')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/dashboard/settings')}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('settings')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login-options')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IoIosLogIn className="text-2xl md:text-3xl" />
                  </motion.div>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lg:hidden mt-3 pb-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="flex flex-col space-y-3 px-2">
                <motion.li
                  className="cursor-pointer hover:text-emerald-400 transition-colors text-sm sm:text-base"
                  whileTap={{ scale: 0.97 }}
                >
                  {t('explore')}
                </motion.li>

                {isShopEnabled && (
                  <motion.li
                    className="cursor-pointer hover:text-emerald-400 transition-colors text-sm sm:text-base"
                    whileTap={{ scale: 0.97 }}
                  >
                    <a href="/shop">{t('shop')}</a>
                  </motion.li>
                )}

                {isHotelsEnabled && (
                  <motion.li
                    className="cursor-pointer hover:text-emerald-400 transition-colors text-sm sm:text-base"
                    whileTap={{ scale: 0.97 }}
                  >
                    <a href="/book-hotel">{t('hotels')}</a>
                  </motion.li>
                )}

                <motion.li
                  className="cursor-pointer hover:text-emerald-400 transition-colors text-sm sm:text-base"
                  whileTap={{ scale: 0.97 }}
                >
                  {t('mission')}
                </motion.li>

                <li className="flex items-center">
                  <MdLanguage className="text-white text-lg sm:text-xl mr-2" />
                  <select
                    className="bg-transparent text-white text-sm sm:text-base border border-white/20 rounded px-1 py-1"
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                  >
                    {languages.map((language) => (
                      <option
                        key={language.code}
                        value={language.code}
                        className="bg-black"
                      >
                        {language?.name}
                      </option>
                    ))}
                  </select>
                </li>

                <li className="flex justify-start">
                  {loading ? (
                    <Loader />
                  ) : user.user ? (
                    <div
                      className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      onClick={() => navigateprofile()}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center rounded-full">
                        {user?.user?.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm sm:text-base">
                        {t('profile')}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      onClick={() => navigate('/login-options')}
                    >
                      <IoIosLogIn className="text-xl sm:text-2xl" />
                      <span className="text-sm sm:text-base">{t('login')}</span>
                    </div>
                  )}
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};
