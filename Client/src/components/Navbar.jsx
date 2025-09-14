"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Pages/AuthProvider"
import { useWebsiteSettings } from "../contexts/WebsiteSettingsContext"
import { MapPin, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import UserProfileDropdown from "./UserProfileDropdown"
import LanguageSelector from "./LanguageSelector"
import { Button } from "./ui/button"
import { useTranslation } from "react-i18next"

export const Navbar = () => {
  const { user, logout } = useAuth()
  const { isShopEnabled, isHotelsEnabled } = useWebsiteSettings()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Filter menu items based on website settings
  const menuItems = [
    { label: t("explore"), path: "/browse" },
    ...(isShopEnabled ? [{ label: t("shop"), path: "/shop" }] : []),
    ...(isHotelsEnabled ? [{ label: t("hotels"), path: "/book-hotel" }] : []),
    { label: t("mission"), path: "#mission" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Adventure Bookings</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex space-x-6 items-center">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <LanguageSelector />

            {user?.user ? (
              <UserProfileDropdown user={user.user} onLogout={handleLogout} />
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                {t("login")}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSelector variant="icon-only" />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t">
                {user?.user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {user?.user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{user?.user?.email}</p>
                        <p className="text-sm text-gray-500">{t("level")}: Explorer</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      {t("logout")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      navigate("/login")
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  >
                    {t("login")}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
