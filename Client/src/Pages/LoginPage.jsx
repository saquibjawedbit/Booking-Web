import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Eye, EyeClosed, Facebook, Linkedin, Lock, LogInIcon, Phone, User } from "lucide-react";
import { MdEmail } from "react-icons/md";
import { useForm } from "react-hook-form";
import { GoogleLoginSuccess, ResendOtp, UserLogin, UserRegister, VerifyUser } from "../Auth/UserAuth";
import { Checkbox, Modal } from "antd";
import {
  InputOTPSlot,
  InputOTP,
  InputOTPGroup,
} from "../components/ui/input-otp";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./AuthProvider";
import { Loader } from "../components/Loader";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";

export default function LoginPage() {
  document.title = "Adventure Login"
  const dispatch = useDispatch();
  const [viewPassword, setViewPassword] = useState(false);
  const [usingPhone, setUsingPhone] = useState(false);
  const [signup, setSignup] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [openOtp, setopenOtp] = useState(false);
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [loader, setloader] = useState(false);
  const [otpLoader, setOtpLoader] = useState(false);
  const { user, loading } = useAuth();
  const Navigate = useNavigate();

  const onReady = (reactPlayer) => {
    const internalPlayer = reactPlayer.getInternalPlayer();
    // Tries to set quality — doesn't always work depending on YouTube
    if (internalPlayer.setPlaybackQuality) {
      internalPlayer.setPlaybackQuality('hd1080'); // 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'
    }
  };
  const onSubmit = async (data) => {
    // Validate form data before submission
    if (!validateFormData(data)) {
      return;
    }

    setloader(true);
    try {
      if (signup) {
        setEmail(data.email);
        const res = await UserRegister(data);
        if (res === 201) {
          setopenOtp(true);
          toast.success("Registration successful! Please check your email for OTP verification.");
        } else if (res === 409) {
          toast.error("User already exists with this email. Please use a different email or try logging in.");
        }
        reset();
      } else {
        const res = await UserLogin(data, dispatch);
        setEmail(data.email);
        const user = res.data?.data?.user;

    console.log("✅ Logged in user:", user);
    console.log("🎯 Instructor ID:", user?.instructor);


        if (res.status === 200) {
          toast.success("Login successful! Welcome back.");
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message || "";

        switch (statusCode) {
          case 400:
            if (signup) {
              toast.error("Invalid input data. Please check all required fields.");
            } else {
              toast.error("Invalid password. Please check your password and try again.");
            }
            break;
          case 401:
            toast.error("Unauthorized access. Please check your credentials.");
            break;
          case 403:
            toast.warning("Your account is not verified. Please check your email for verification code.");
            setEmail(data.email);
            setopenOtp(true);
            try {
              await ResendOtp(data.email);
              toast.info("New verification code sent to your email.");
            } catch (resendErr) {
              console.error("Resend OTP error:", resendErr);
              toast.error("Failed to resend verification code. Please try again.");
            }
            break;
          case 404:
            if (signup) {
              toast.error("Registration failed. Please try again.");
            } else {
              toast.error("No account found with this email address. Please check your email or sign up for a new account.");
            }
            break;
          case 409:
            toast.error("An account with this email already exists. Please use a different email or try logging in.");
            break;
          case 500:
            toast.error("Server error. Please try again later or contact support if the problem persists.");
            break;
          default:
            if (signup) {
              toast.error("Registration failed. Please try again.");
            } else {
              toast.error("Login failed. Please check your credentials and try again.");
            }
        }
      } else if (err.request) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
    finally {
      setloader(false);
    }
  };
  const verifyOtp = async () => {
    if (!value || value.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }

    setOtpLoader(true);
    try {
      const data = { email, otp: value };
      const res = await VerifyUser(data, dispatch);
      if (res === 200) {
        toast.success("Email verified successfully! Welcome to our platform.");
        setopenOtp(false);
        setValue("");
      } else if (res === 400) {
        toast.error("Invalid or expired OTP. Please check the code and try again.");
      } else {
        toast.error("OTP verification failed. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            toast.error("Invalid OTP code. Please check and try again.");
            break;
          case 404:
            toast.error("User not found. Please register first.");
            break;
          case 410:
            toast.error("OTP has expired. Please request a new one.");
            break;
          default:
            toast.error("OTP verification failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    } finally {
      setOtpLoader(false);
    }
  };

  const handleModeSwitch = () => {
    setSignup(!signup);
    reset(); // Clear form data
    setValue(""); // Clear OTP
    setEmail(""); // Clear email
    setopenOtp(false); // Close OTP modal if open
  };

  const cancel = () => {
    setopenOtp(false);
    setValue("");
    setEmail("");
  };

  const validateFormData = (data) => {
    if (!data.email || !data.email.trim()) {
      toast.error("Email is required.");
      return false;
    }

    if (!data.password || !data.password.trim()) {
      toast.error("Password is required.");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    // Password validation for signup
    if (signup) {
      if (data.password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return false;
      }

      if (!data.name || !data.name.trim()) {
        toast.error("Name is required for registration.");
        return false;
      }

      if (data.confirmPassword !== data.password) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const onGoogleLoginSucces = async (response) => {
    try {
      const res = await GoogleLoginSuccess(response, dispatch);
      if (res) {
        toast.success("Google login successful! Welcome back.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            toast.error("Invalid Google authentication token. Please try again.");
            break;
          case 401:
            toast.error("Google authentication failed. Please try again.");
            break;
          case 500:
            toast.error("Server error during Google login. Please try again later.");
            break;
          default:
            toast.error("Google login failed. Please try again or use email/password.");
        }
      } else {
        toast.error("Google login failed. Please try again or use email/password.");
      }
    }
  }


  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email not found. Please try logging in again.");
      return;
    }

    try {
      toast.loading("Resending verification code...");
      await ResendOtp(email);
      toast.dismiss();
      toast.success("New verification code sent to your email!");
    } catch (err) {
      toast.dismiss();
      console.error("Resend OTP error:", err);
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 404:
            toast.error("User not found. Please register first.");
            break;
          case 429:
            toast.error("Too many requests. Please wait before requesting another code.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error("Failed to resend verification code. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    }
  };

  const linkedInLogin = () => {
    try {
      const REDIRECT_URI = "http://localhost:5173/auth/signInWithLinkedin";
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${import.meta.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`;

      if (!import.meta.env.VITE_LINKEDIN_CLIENT_ID) {
        toast.error("LinkedIn login is not configured. Please contact support.");
        return;
      }

      window.location.href = authUrl;
    } catch (err) {
      console.error("LinkedIn login error:", err);
      toast.error("LinkedIn login failed. Please try again or use email/password.");
    }
  }

  const facebookLogin = () => {
    try {
      const REDIRECT_URI = "http://localhost:5173/auth/signInWithFacebook";
      const authUrl = `https://www.facebook.com/v11.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state="{st=state123abc,ds=123456789}"&scope=email,public_profile&response_type=code`;

      if (!import.meta.env.VITE_FACEBOOK_CLIENT_ID) {
        toast.error("Facebook login is not configured. Please contact support.");
        return;
      }

      window.location.href = authUrl;
    } catch (err) {
      console.error("Facebook login error:", err);
      toast.error("Facebook login failed. Please try again or use email/password.");
    }
  }

  useEffect(() => {
    if (user.user !== null && !loading) {
      // Check if there's a redirect URL stored in localStorage
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");

      if (redirectAfterLogin) {
        // Clear the stored redirect URL
        localStorage.removeItem("redirectAfterLogin");
        // Navigate to the stored URL
        Navigate(redirectAfterLogin);
        return;
      }

      // Default role-based navigation
      if (user.user.role === "hotel") {
        Navigate("/hotel");
      }
      else if (user.user.role === "instructor") {
        Navigate("/instructor/dashboard");
      }
      else if (user.user.role === "admin") {
        Navigate("/admin");
      }
      else {
        Navigate("/browse");
      }
    }
  }
    , [user, loading, Navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative">
      {/* Background Video - Fixed at 100vh */}
      <div className="bg absolute top-0 left-0 w-full h-screen overflow-hidden -z-50">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <ReactPlayer
          url={"https://youtu.be/FfPVvtNo92s"}
          onReady={onReady}
          controls={false}
          loop={true}
          playing={true}
          muted={true}
          width="100%"
          height="100%"
        />
      </div>
      <div className="login relative  bg-gradient-to-b from-[#CEF2FF] to-white rounded-xl shadow-lg flex flex-col items-center justify-items-end  md:py-8 md:px-10 lg:w-1/2 py-4">
        <Modal open={openOtp} footer={null} onCancel={cancel}>
          <div className="space-y-2 flex flex-col items-center gap-4">
            <h1 className="text-lg font-semibold text-center">
              Enter One-Time Password sent to{" "}
              <span className="text-blue-500 break-all">{email}</span>
            </h1>
            <p className="text-sm text-gray-600 text-center">
              Please check your email and enter the 6-digit verification code
            </p>
            <InputOTP
              maxLength={6}
              value={value}
              onChange={(value) => setValue(value)}
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
            <div className="w-full space-y-3">
              <button
                onClick={verifyOtp}
                disabled={value.length !== 6 || otpLoader}
                className="bg-black text-white rounded-2xl py-2 w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {otpLoader ? <Loader btn={true} /> : "Verify OTP"}
              </button>
              <button
                onClick={handleResendOtp}
                type="button"
                disabled={otpLoader}
                className="text-blue-500 text-sm w-full py-1 hover:text-blue-700 transition-colors disabled:text-gray-400"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </div>
        </Modal>
        <div className="form w-full flex flex-col">
          <div className="header flex flex-col items-center gap-4">
            <div className="icon bg-white rounded-2xl shadow-[#a4e0f6] shadow-lg p-4">
              <LogInIcon className="text-black" />
            </div>
            <h1 className="text-2xl font-semibold w-full text-center ">
              {signup ? "Sign Up" : "Sign In"}
            </h1>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="Form md:px-12 px-5 py-4 gap-2 flex flex-col mt-5"
          >
            <div className="email px-4 md:py-5 py-3 bg-gray-200 flex gap-6 items-center rounded-2xl">
              {usingPhone ? (
                <div className="flex gap-6 items-center">
                  <Phone className="text-gray-600 text-2xl" />
                  <input
                    type="number"
                    placeholder="Phone Number"
                    {...register("phone", { required: signup })}
                    className="w-full bg-transparent h-full outline-none border-none"
                  />
                </div>
              ) : (
                <div className="flex gap-6 items-center w-full">
                  <MdEmail className="text-gray-600 text-2xl" />
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address"
                      }
                    })}
                    autoComplete="off"
                    className="w-full bg-transparent outline-none border-none"
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setUsingPhone(!usingPhone)}
              className="text-gray-600 cursor-pointer w-fit md:text-sm text-xs text-left"
            >
              {usingPhone ? "Use Email instead" : "Use Phone instead"}
            </button>
            {signup && (
              <div className="name px-4 md:py-5 py-3 bg-gray-200 flex gap-6 items-center rounded-2xl">
                <User className="text-gray-600 text-2xl" />
                <input
                  type="text"
                  placeholder="Full Name"
                  {...register("name", {
                    required: signup ? "Name is required" : false,
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters long"
                    }
                  })}
                  className="w-full bg-transparent outline-none border-none"
                />
              </div>
            )}
            <div className="password px-4 md:py-5 py-3 bg-gray-200 flex gap-6 items-center rounded-2xl">
              <Lock className="text-gray-600 text-2xl" />
              <input
                type={viewPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: signup ? {
                    value: 6,
                    message: "Password must be at least 6 characters long"
                  } : undefined
                })}
                className="w-full bg-transparent outline-none border-none"
              />
              {!viewPassword ? (
                <EyeClosed
                  className="text-gray-600 text-2xl cursor-pointer"
                  onClick={() => setViewPassword(true)}
                />
              ) : (
                <Eye
                  className="text-gray-600 text-2xl cursor-pointer"
                  onClick={() => setViewPassword(false)}
                />
              )}
            </div>
            {signup && (
              <div className="password px-4 md:py-5 py-3 bg-gray-200 flex gap-6 items-center rounded-2xl">
                <Lock className="text-gray-600 text-2xl" />
                <input
                  type={viewPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: signup ? "Please confirm your password" : false,
                    validate: signup ? (value) => {
                      const password = document.querySelector('input[name="password"]').value;
                      return value === password || "Passwords do not match";
                    } : undefined
                  })}
                  className="w-full bg-transparent outline-none border-none"
                />
              </div>
            )}
            {signup && (
              <div className="terms">
                <Checkbox>
                  <span className="text-gray-600 text-sm">
                    I agree to the <a href="/terms" className="text-blue-500 hover:text-blue-700 transition-colors">
                      Terms of Service
                    </a>
                  </span>
                </Checkbox>
              </div>
            )}
            <div className="forgot mt-1 flex flex-col items-center justify-between gap-2">
              <div
                onClick={handleModeSwitch}
                className="text-gray-600 md:text-sm text-xs text-center cursor-pointer"
              >
                {signup ? (
                  <p>
                    Already have an account?{" "}
                    <span className="text-blue-500 hover:text-blue-700 transition-colors">Sign In</span>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <span className="text-blue-500 hover:text-blue-700 transition-colors">Sign Up</span>
                  </p>
                )}
              </div>
              {!signup && (
                <button
                  type="button"
                  onClick={() => Navigate('/reset')}
                  className="text-gray-600 md:text-sm w-fit text-xs text-center cursor-pointer hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            {signup ? (
              <div className="button w-full bg-black rounded-2xl">
                <button
                  type="submit"
                  disabled={loader}
                  className="w-full text-white cursor-pointer py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loader ? <Loader btn={true} /> : "Sign Up"}
                </button>
              </div>
            ) : (
              <div className="button w-full bg-black rounded-2xl">
                <button
                  type="submit"
                  disabled={loader}
                  className="w-full cursor-pointer text-white py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loader ? <Loader btn={true} /> : "Sign In"}
                </button>
              </div>
            )}
          </form>
        </div>
        <div className="alternate ">
          <p className="text-gray-500 text-sm text-center">
            {signup ? "Or Sign Up with" : "Or Sign In with"}
          </p>
          <div className="google flex gap-5 md:mt-3">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLogin onSuccess={onGoogleLoginSucces} />
            </GoogleOAuthProvider>
            <div className="flex gap-2 items-center border px-3 rounded-[5px]" onClick={linkedInLogin}>
              <Linkedin />
            </div>
            <div className="flex gap-2 items-center border px-3 rounded-[5px]" onClick={facebookLogin}><Facebook /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
