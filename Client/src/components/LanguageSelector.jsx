'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateLanguageHeaders } from '../Api/language.api.js';
import { setLanguage } from '../Store/LanguageSlice.js';
import { Button } from './ui/button';

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    fullName: 'English (UK)',
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    fullName: 'French',
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    fullName: 'German',
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    fullName: 'Spanish',
  },
  {
    code: 'it',
    name: 'Italiano',
    flag: '🇮🇹',
    fullName: 'Italian',
  },
];

const LanguageSelector = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLanguageCode = useSelector(
    (state) => state.language.currentLanguage
  );
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    languages.find((lang) => lang.code === currentLanguageCode) || languages[0]
  );

  useEffect(() => {
    // Update current language when Redux state changes
    const lang = languages.find((lang) => lang.code === currentLanguageCode);
    if (lang) {
      setCurrentLanguage(lang);
      // Update i18n if it's different
      if (i18n.language !== currentLanguageCode) {
        i18n.changeLanguage(currentLanguageCode);
      }
      // Update axios headers
      updateLanguageHeaders(currentLanguageCode);
    }
  }, [currentLanguageCode, i18n]);

  // Initialize language on component mount
  useEffect(() => {
    // Initialize Redux state from localStorage if needed
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== currentLanguageCode) {
      dispatch(setLanguage(savedLanguage));
    }

    // Set initial headers
    updateLanguageHeaders(currentLanguageCode);
  }, []);

  const changeLanguage = (language) => {
    // Show loading indicator or message
    const prevLanguage = currentLanguageCode;

    // Update Redux state (this will trigger localStorage save)
    dispatch(setLanguage(language.code));

    // Update i18n immediately
    i18n.changeLanguage(language.code);

    // Update axios headers
    updateLanguageHeaders(language.code);

    // Close dropdown
    setIsOpen(false);

    // Refresh the page after a short delay to allow state updates
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Variants for animations
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
    hover: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      transition: { duration: 0.1 },
    },
  };

  // Different styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'icon-only':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-full';
      default:
        return 'bg-white/90 backdrop-blur-sm hover:bg-white/100 text-gray-800 border border-gray-200 shadow-sm';
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${getButtonStyles()}`}
        variant="ghost"
      >
        {variant !== 'icon-only' && (
          <>
            <span className="text-xl">{currentLanguage.flag}</span>
            {variant !== 'minimal' && <span>{currentLanguage?.name}</span>}
          </>
        )}
        {variant === 'icon-only' && <Globe className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing when clicking outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                <h3 className="text-sm font-medium">Select Language</h3>
              </div>
              <div className="py-2 max-h-[300px] overflow-y-auto">
                {languages.map((language, index) => (
                  <motion.button
                    key={language.code}
                    className={`flex items-center w-full px-4 py-2.5 text-left text-sm ${
                      currentLanguage.code === language.code
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => changeLanguage(language)}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <span className="text-xl mr-3">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {language.fullName}
                      </div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
