import { Modal } from 'antd';
import {
  Building,
  Euro,
  FileText,
  ImageIcon,
  Link,
  Mail,
  MapPin,
  Phone,
  Star,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { registerHotel, verify } from '../../Api/hotel.api.js';
import { fetchLocations } from '../../Api/location.api.js';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../../components/ui/input-otp';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
export const HotelRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    location: '',
    address: '',
    phone: '',
    managerName: '',
    rooms: '',
    amenities: [],
    profileImage: null,
    hotelImages: [],
    businessLicense: null,
    taxCertificate: null,
    insuranceDocument: null,
    role: 'hotel',
    price: 0,
    pricePerNight: 0,
    rating: 0,
    socialMedias: [],
    website: '',
    category: 'hotel',
  });

  const [error, setError] = useState('');
  const [otpDialog, setOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setlocation] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [allAmenities, setAllAmenities] = useState([]);
  // Social media state
  const [customSocial, setCustomSocial] = useState('');
  const [allSocials, setAllSocials] = useState([]);

  const passValidation = () => {
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password.length > 0 &&
      formData.confirmPassword.length > 0
    ) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
      } else {
        setError('');
      }
    }
  };

  useEffect(() => {
    passValidation();
  }, [formData.password, formData.confirmPassword]);

  const getLocation = async () => {
    const res = await fetchLocations();
    console.log(res);
    if (res.statusCode === 200) {
      setlocation(res.data);
    } else {
      toast.error('Failed to fetch locations');
    }
  };
  useEffect(() => {
    getLocation();
  }, []);

  // Helper to get current label (Hotel/Camping/Glamping)
  const getLabel = () => {
    if (formData.category === 'camping') return 'Camping';
    if (formData.category === 'glamping') return 'Glamping';
    return 'Hotel';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  const handleHotelImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.hotelImages.length > 6) {
      toast.error('You can upload up to 6 images only');
      return;
    }

    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setFormData((prev) => ({
      ...prev,
      hotelImages: [...prev.hotelImages, ...newImages],
    }));
  };

  const handleDocumentChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const removeHotelImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      hotelImages: prev.hotelImages.filter((_, i) => i !== index),
    }));
  };

  // Refactored: Only send email to trigger OTP on submit, send full data after OTP
  const handleSubmit = async (e) => {
    e.preventDefault && e.preventDefault();
    if (otpDialog) {
      // This means user is submitting OTP, so send full registration data
      if (error) {
        toast.error(error);
        return;
      }
      // Validate required fields (repeat for safety)
      if (!formData?.name) {
        toast.error('Hotel name is required');
        return;
      }
      if (!formData.location) {
        toast.error('Location is required');
        return;
      }
      if (!formData.description) {
        toast.error('Description is required');
        return;
      }
      if (!formData.rooms || formData.rooms <= 0) {
        toast.error('Number of rooms is required and must be greater than 0');
        return;
      }
      if (!formData.businessLicense) {
        toast.error('Business license is required');
        return;
      }
      if (formData.hotelImages.length === 0) {
        toast.error('At least one hotel image is required');
        return;
      }
      setLoading(true);
      const toastId = toast.loading('Processing your request...');
      try {
        const data = new FormData();
        data.append('name', formData?.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('confirmPassword', formData.confirmPassword);
        data.append('description', formData.description);
        data.append('location', formData.location);
        data.append('address', formData.address);
        data.append('phone', formData.phone);
        data.append('managerName', formData.managerName);
        data.append('rooms', formData.rooms);
        data.append('role', formData.role);
        data.append('price', formData.price);
        data.append('pricePerNight', formData.pricePerNight);
        data.append('rating', formData.rating);
        data.append('website', formData.website);
        data.append('otp', otp);
        data.append('category', formData.category);
        formData.amenities.forEach((amenity) => {
          data.append('amenities[]', amenity);
        });
        if (formData.profileImage)
          data.append('profileImage', formData.profileImage);
        if (formData.businessLicense)
          data.append('businessLicense', formData.businessLicense);
        if (formData.taxCertificate)
          data.append('taxCertificate', formData.taxCertificate);
        if (formData.insuranceDocument)
          data.append('insuranceDocument', formData.insuranceDocument);
        if (formData.hotelImages && formData.hotelImages.length > 0) {
          formData.hotelImages.forEach((image) => {
            data.append('hotelImages', image.file);
          });
        }
        if (formData.socialMedias && formData.socialMedias.length > 0) {
          formData.socialMedias.forEach((link) => {
            data.append('socialMedias[]', link);
          });
        }
        const res = await registerHotel(data);
        if (res.statusCode === 201) {
          toast.success('Hotel Registration successful!');
          setOtpDialog(false);
          setOtp('');
        }
      } catch (err) {
        const message =
          err?.response?.data?.message || err.message || 'Registration failed';
        toast.error(message, { id: toastId });
      } finally {
        setLoading(false);
      }
    } else {
      // This means user is clicking submit for the first time, so only send email for OTP
      if (!formData.email) {
        toast.error('Email is required');
        return;
      }
      setLoading(true);
      const toastId = toast.loading('Sending OTP...');
      try {
        const data = { email: formData.email };
        const res = await verify(data);
        if (res.status === 200) {
          toast.success('OTP sent successfully', { id: toastId });
          setOtpDialog(true);
        } else if (res.status === 409) {
          toast.error('User already exists', { id: toastId });
        } else {
          toast.error('Failed to send OTP', { id: toastId });
        }
      } catch (err) {
        const message =
          err?.response?.data?.message || err.message || 'Failed to send OTP';
        toast.error(message, { id: toastId });
      } finally {
        setLoading(false);
      }
    }
  };

  const cancel = () => {
    setOtpDialog(false);
    setOtp('');
  };

  // Handles OTP verification and registration
  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    // Validate required fields (repeat for safety)
    if (error) {
      toast.error(error);
      return;
    }
    if (!formData?.name) {
      toast.error('Hotel name is required');
      return;
    }
    if (!formData.location) {
      toast.error('Location is required');
      return;
    }
    if (!formData.description) {
      toast.error('Description is required');
      return;
    }
    if (!formData.rooms || formData.rooms <= 0) {
      toast.error('Number of rooms is required and must be greater than 0');
      return;
    }
    if (!formData.businessLicense) {
      toast.error('Business license is required');
      return;
    }
    if (formData.hotelImages.length === 0) {
      toast.error('At least one hotel image is required');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Processing your request...');
    try {
      const data = new FormData();
      data.append('name', formData?.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('confirmPassword', formData.confirmPassword);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('address', formData.address);
      data.append('phone', formData.phone);
      data.append('managerName', formData.managerName);
      data.append('rooms', formData.rooms);
      data.append('role', formData.role);
      data.append('price', formData.price);
      data.append('otp', otp);
      data.append('category', formData.category);
      formData.amenities.forEach((amenity) => {
        data.append('amenities[]', amenity);
      });
      if (formData.profileImage)
        data.append('profileImage', formData.profileImage);
      if (formData.businessLicense)
        data.append('businessLicense', formData.businessLicense);
      if (formData.taxCertificate)
        data.append('taxCertificate', formData.taxCertificate);
      if (formData.insuranceDocument)
        data.append('insuranceDocument', formData.insuranceDocument);
      if (formData.hotelImages && formData.hotelImages.length > 0) {
        formData.hotelImages.forEach((image) => {
          data.append('hotelImages', image.file);
        });
      }
      if (formData.socialMedias && formData.socialMedias.length > 0) {
        formData.socialMedias.forEach((link) => {
          data.append('socialMedias[]', link);
        });
      }
      const res = await registerHotel(data);
      if (res.statusCode === 201) {
        toast.success('Hotel Registration successful!', { id: toastId });
        setOtpDialog(false);
        setOtp('');
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || 'Registration failed';
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 py-8 bg-gray-50">
      <Card className="w-full max-w-6xl p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {getLabel()} Registration
          </h1>
          <p className="text-gray-600">
            Register your {getLabel().toLowerCase()} to join our adventure
            platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4 flex items-center gap-4">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-black transition-all focus:scale-[1.01]"
            >
              <option value="hotel">Hotel</option>
              <option value="camping">Camping</option>
              <option value="glamping">Glamping</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column - Basic Information */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    {getLabel()} Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData?.name}
                    onChange={handleChange}
                    placeholder={`Enter ${getLabel().toLowerCase()} name`}
                    required
                    className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter hotel email address"
                    required
                    className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                  </div>
                </div>
                {error && (
                  <div className="text-red-500 text-sm">
                    <p>{error}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </Label>
                    <select
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="border  rounded px-3 py-2 focus:ring-2 focus:ring-black transition-all focus:scale-[1.01]"
                    >
                      <option value="" disabled>
                        Select location
                      </option>
                      {location.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc?.name}
                        </option>
                      ))}
                    </select>
                  </div>{' '}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center">
                      <Euro className="h-4 w-4 mr-2" />
                      Base Price
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter base price"
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="pricePerNight"
                      className="flex items-center"
                    >
                      <Euro className="h-4 w-4 mr-2" />
                      Price Per Night
                    </Label>
                    <Input
                      id="pricePerNight"
                      name="pricePerNight"
                      type="number"
                      value={formData.pricePerNight}
                      onChange={handleChange}
                      placeholder="Enter price per night"
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                  </div>{' '}
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Initial Rating
                    </Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleChange}
                      placeholder="Enter rating (0-5)"
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={`Enter complete ${getLabel().toLowerCase()} address`}
                    className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>
                {formData.category !== 'camping' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Phone
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Contact number"
                          className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="managerName"
                          className="flex items-center"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Manager Name
                        </Label>
                        <Input
                          id="managerName"
                          name="managerName"
                          value={formData.managerName}
                          onChange={handleChange}
                          placeholder={`${getLabel()} manager`}
                          className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="managerName"
                          className="flex items-center"
                        >
                          <Link className="h-4 w-4 mr-2" />
                          {getLabel()} Website
                        </Label>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder={`${getLabel()} website URL`}
                          className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Social Media Links</Label>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="url"
                            value={customSocial}
                            onChange={(e) => setCustomSocial(e.target.value)}
                            placeholder="Add social media URL"
                            className="border rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = customSocial.trim();
                              if (trimmed && !allSocials.includes(trimmed)) {
                                setAllSocials((prev) => [...prev, trimmed]);
                                setFormData((prev) => ({
                                  ...prev,
                                  socialMedias: [...prev.socialMedias, trimmed],
                                }));
                                setCustomSocial('');
                              }
                            }}
                            className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allSocials.map((social) => (
                            <div
                              key={social}
                              className="flex items-center gap-2 bg-blue-100 px-2 py-1 rounded"
                            >
                              <a
                                href={social}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-blue-700 max-w-[180px] truncate"
                              >
                                {social}
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setAllSocials((prev) =>
                                    prev.filter((s) => s !== social)
                                  );
                                  setFormData((prev) => ({
                                    ...prev,
                                    socialMedias: prev.socialMedias.filter(
                                      (s) => s !== social
                                    ),
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Number of Rooms</Label>
                      <Input
                        id="rooms"
                        name="rooms"
                        type="number"
                        value={formData.rooms}
                        onChange={handleChange}
                        placeholder={`Total ${getLabel().toLowerCase()} rooms available`}
                        min="1"
                        required
                        className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{getLabel()} Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={`Describe your ${getLabel().toLowerCase()}, its features, and what makes it special...`}
                    className="min-h-32 transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>
                {/* Hide amenities for camping */}
                {formData.category !== 'camping' && (
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        placeholder={`Add ${getLabel().toLowerCase()} amenity`}
                        className="border rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = customAmenity.trim();
                          if (trimmed && !allAmenities.includes(trimmed)) {
                            setAllAmenities((prev) => [...prev, trimmed]);
                            setFormData((prev) => ({
                              ...prev,
                              amenities: [...prev.amenities, trimmed],
                            }));
                            setCustomAmenity('');
                          }
                        }}
                        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allAmenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded"
                        >
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAllAmenities((prev) =>
                                prev.filter((a) => a !== amenity)
                              );
                              setFormData((prev) => ({
                                ...prev,
                                amenities: prev.amenities.filter(
                                  (a) => a !== amenity
                                ),
                              }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Hide logo/profile image for camping */}
                {formData.category !== 'camping' && (
                  <div className="space-y-2">
                    <Label htmlFor="profileImage" className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {getLabel()} Logo/Profile Image
                    </Label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                    {formData.profileImage && (
                      <div className="mt-2 w-24 h-24 relative">
                        <img
                          src={
                            URL.createObjectURL(formData.profileImage) ||
                            '/placeholder.svg'
                          }
                          alt={`${getLabel()} Logo`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="hotelImages" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    {getLabel()} Images (Max 6)
                  </Label>
                  <Input
                    id="hotelImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleHotelImagesChange}
                    disabled={formData.hotelImages.length >= 6}
                    className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.hotelImages.map((img, index) => (
                      <div key={index} className="relative group w-[31%] h-24">
                        <img
                          src={img.url || '/placeholder.svg'}
                          alt={`${getLabel()} ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          onClick={() => removeHotelImage(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Required Documents</h3>

                  <div className="space-y-2">
                    <Label
                      htmlFor="businessLicense"
                      className="flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Business License
                    </Label>
                    <Input
                      id="businessLicense"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleDocumentChange('businessLicense', e)
                      }
                      required
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                    {formData.businessLicense && (
                      <p className="text-sm text-green-600">
                        {formData.businessLicense?.name} uploaded
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="taxCertificate"
                      className="flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Tax Certificate
                    </Label>
                    <Input
                      id="taxCertificate"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleDocumentChange('taxCertificate', e)
                      }
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                    {formData.taxCertificate && (
                      <p className="text-sm text-green-600">
                        {formData.taxCertificate?.name} uploaded
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="insuranceDocument"
                      className="flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Insurance Document
                    </Label>
                    <Input
                      id="insuranceDocument"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleDocumentChange('insuranceDocument', e)
                      }
                      className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                    />
                    {formData.insuranceDocument && (
                      <p className="text-sm text-green-600">
                        {formData.insuranceDocument?.name} uploaded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-gray-800 text-white transition-transform active:scale-95"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : otpDialog
                  ? 'Verify OTP'
                  : 'Submit Hotel Application'}
            </Button>
            <p className="mt-3 text-center text-sm text-gray-500">
              By submitting, you agree to our terms and conditions. Your
              application will be reviewed by our team.
            </p>
          </div>
        </form>
      </Card>

      <Modal open={otpDialog} footer={null} onCancel={cancel}>
        <div className="space-y-2 flex flex-col items-center gap-4">
          <h1>Enter One-Time Password sent</h1>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            type="button"
            className="w-full bg-black hover:bg-gray-800 text-white rounded-2xl py-2"
            loading={loading}
            onClick={handleOtpVerification}
          >
            Verify OTP
          </Button>
        </div>
      </Modal>
    </div>
  );
};
