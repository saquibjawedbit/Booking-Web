'use client';

import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { VerifyUser } from '../../Auth/UserAuth';
import { axiosClient } from '../../AxiosClient/axios';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../../components/ui/input-otp';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useAdventures } from '../../hooks/useAdventure';
import { DocumentUpload } from './components/DocumentUpload';
import { MediaUpload } from './components/MediaUpload';
import { ProfileImageUpload } from './components/ProfileImageUpload';

export const InstructorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    adventure: '',
    location: '',
    role: 'instructor',
    profileImage: null,
    mediaFiles: [],
    certificate: null,
    governmentId: null,
  });

  const [error, setError] = useState('');
  const [otpDialog, setOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { adventures } = useAdventures();
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'adventure') {
      const currentLocation = adventures.find(
        (adventure) => adventure._id === value
      );
      setLocations(currentLocation?.location);
    }
  };

  const handleProfileImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));
  };

  const handleMediaFilesChange = (files) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files],
    }));
  };

  const handleDocumentChange = (type, file) => {
    setFormData((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const removeMediaFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) {
      toast.error(error);
      return;
    }

    if (!formData.bio) {
      toast.error('Bio is required');
      return;
    }
    if (!formData.adventure) {
      toast.error('Adventure is required');
      return;
    }
    if (!formData.location) {
      toast.error('Location is required');
      return;
    }
    if (!formData.certificate) {
      toast.error('Certificate is required');
      return;
    }
    if (!formData.governmentId) {
      toast.error('Government ID is required');
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
      data.append('description', formData.bio);
      data.append('adventure', formData.adventure);
      data.append('location', formData.location);
      data.append('role', formData.role);
      if (formData.profileImage)
        data.append('profileImage', formData.profileImage);
      if (formData.certificate)
        data.append('certificate', formData.certificate);
      if (formData.governmentId)
        data.append('governmentId', formData.governmentId);
      if (formData.mediaFiles && formData.mediaFiles.length > 0) {
        formData.mediaFiles.forEach((file) => {
          data.append('portfolioMedias', file);
        });
      }

      const response = await axiosClient.post(
        '/api/auth/instructor/register',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success(
        'Registration successful! Please verify OTP sent to your email.',
        { id: toastId }
      );
      setOtpDialog(true);
    } catch (err) {
      console.log(err);
      const message =
        err?.response?.data?.message || err.message || 'Registration failed';
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    return formData?.name ? formData?.name.charAt(0).toUpperCase() : 'Hii';
  };

  const cancel = () => {
    setOtpDialog(false);
    setOtp('');
  };

  const verifyOtp = async () => {
    const data = { email: formData.email, otp: otp };
    const res = await VerifyUser(data, dispatch);
    if (res === 200) {
      toast('Email Verified Successfully');
      setOtpDialog(false);
      setOtp('');
      navigate('/instructor/pending-review');
    } else if (res === 400) {
      toast('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <Card className="w-full max-w-6xl p-4 sm:p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Instructor Registration
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Join our team of professional instructors
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
            {/* Left Column - Basic Information */}
            <div className="space-y-6 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
              <div className="flex flex-col items-center mb-6">
                <ProfileImageUpload
                  initialImage={formData.profileImage}
                  onChange={handleProfileImageChange}
                  getInitial={getInitial}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData?.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>

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
                {error && (
                  <div className="text-red-500 text-sm">
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Professional Information */}
            <div className="space-y-6 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your experience, qualifications, and teaching style..."
                    className="min-h-32 transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adventure">Adventure Specialty</Label>
                    <Select
                      value={formData.adventure}
                      onValueChange={(value) =>
                        handleSelectChange('adventure', value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select adventure" />
                      </SelectTrigger>
                      <SelectContent>
                        {adventures.map((adventure) => (
                          <SelectItem key={adventure._id} value={adventure._id}>
                            {adventure?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) =>
                        handleSelectChange('location', value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location._id} value={location._id}>
                            {location?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <MediaUpload
                  files={formData.mediaFiles}
                  onChange={handleMediaFilesChange}
                  onRemove={removeMediaFile}
                />

                <DocumentUpload
                  certificate={formData.certificate}
                  governmentId={formData.governmentId}
                  onCertificateChange={(file) =>
                    handleDocumentChange('certificate', file)
                  }
                  onGovernmentIdChange={(file) =>
                    handleDocumentChange('governmentId', file)
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white transition-transform active:scale-95"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Application'}
            </Button>
            <p className="mt-3 text-center text-xs sm:text-sm text-gray-500">
              By submitting, you agree to our terms and conditions and
              verification process
            </p>
          </div>
        </form>
      </Card>

      <Modal open={otpDialog} footer={null} onCancel={cancel}>
        <div className="space-y-2 flex flex-col items-center gap-4 p-4">
          <h1 className="text-lg font-semibold">
            Enter One-Time Password sent
          </h1>
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
          <button
            onClick={verifyOtp}
            className="bg-black text-white rounded-2xl py-2 w-full"
          >
            Verify OTP
          </button>
        </div>
      </Modal>
    </div>
  );
};
