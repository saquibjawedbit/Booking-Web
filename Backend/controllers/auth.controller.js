import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import sendEmail from "../utils/sendOTP.js";
import { OAuth2Client } from "google-auth-library";
import {
  getLinkedInAccessToken,
  verifyLinkedInToken,
} from "../utils/linkedinHandler.js";
import {
  getFacebookAccessToken,
  verifyFacebookToken,
} from "../utils/facebookHandler.js";
import { Instructor } from "../models/instructor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

let client = null;

// Create a function to get the client
const getOAuthClient = () => {
  if (!client) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new ApiError(500, "Google Client ID is not configured");
    }
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return client;
};

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (email?.trim() === "" || !email || password?.trim() === "" || !password) {
    throw new ApiError(400, "Email and Password are Required");
  }

  const userExist = await User.findOne({ email: email });

  if (userExist) {
    throw new ApiError(409, "User with this email already exists !");
  }

  const user = await User.create({
    email: email.toLowerCase(),
    password: password,
    name: name,
    role: role,
  });

  const otpCode = Math.floor(100000 + Math.random() * 900000);

  await Otp.create({
    userId: user._id,
    otp: otpCode,
  });

  sendEmail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Verify OTP",
    text: `Hello ${email}, Your OTP for verification is ${otpCode}`,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -role"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  if (role === "instructor") {
    req.user = user;
    return next();
  }

  res.status(201).json(
    new ApiResponse(
      200,
      {
        user: user,
      },
      "User registered Succesfully"
    )
  );
});

const registerInstructor = asyncHandler(async (req, res) => {
  const { description, adventure, location } = req.body;

  if (
    description?.trim() === "" ||
    !description ||
    adventure?.trim() === "" ||
    !adventure ||
    location?.trim() === "" ||
    !location
  ) {
    throw new ApiError(400, "Description, Adventure and Location are Required");
  }

  // Handle uploaded files
  const files = req.files || {};
  let profileImage,
    portfolioMedias = [],
    certificate,
    governmentId;

  if (files.profileImage && files.profileImage[0]) {
    const uploaded = await uploadOnCloudinary(files.profileImage[0].path);
    profileImage = uploaded?.url;
  }
  if (files.portfolioMedias && files.portfolioMedias.length > 0) {
    for (const file of files.portfolioMedias) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded?.url) portfolioMedias.push(uploaded.url);
    }
  }
  if (files.certificate && files.certificate[0]) {
    const uploaded = await uploadOnCloudinary(files.certificate[0].path);
    certificate = uploaded?.url;
  }
  if (files.governmentId && files.governmentId[0]) {
    const uploaded = await uploadOnCloudinary(files.governmentId[0].path);
    governmentId = uploaded?.url;
  }

  // Save profile image to user
  if (profileImage) {
    req.user.profilePicture = profileImage;
  }

  const instructor = await Instructor.create({
    description: description,
    adventure: adventure,
    location: location,
    portfolioMedias: portfolioMedias,
    certificate: certificate,
    governmentId: governmentId,
  });

  if (!instructor) {
    throw new ApiError(
      500,
      "Something went wrong while registering the instructor"
    );
  }

  req.user.instructor = instructor._id;
  await req.user.save();

  res.status(201).json(
    new ApiResponse(
      200,
      {
        instructor: instructor,
        user: req.user,
      },
      "Instructor registered successfully"
    )
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (email?.trim() === "" || !email || otp?.trim() === "" || !otp) {
    throw new ApiError(400, "Email and OTP are Required");
  }

  const user = await User.findOne({ email: email }).select(
    "email phoneNumber name verified role"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpExist = await Otp.findOne({ userId: user._id });

  if (!otpExist) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpExist.otp !== Number(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  otpExist.verified = true;

  await otpExist.save();

  user.verified = true;

  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  user.refreshToken = refreshToken;

  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: user,
          accessToken,
        },
        "User Verified Successfully"
      )
    );
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email }).select("email");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000);
  await Otp.deleteMany({ userId: user._id });

  await Otp.create({
    userId: user._id,
    otp: otpCode,
  });

  sendEmail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Verify OTP",
    text: `Hello ${email}, Your OTP for verification is ${otpCode}`,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        email: email,
      },
      "OTP sent Succesfully"
    )
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email?.trim() === "" || !email || password?.trim() === "" || !password) {
    throw new ApiError(400, "Email and Password are Required");
  }

  const user = await User.findOne({ email: email }).select(
    "email phoneNumber name verified role password instructor"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.password === null || user.password === undefined) {
    throw new ApiError(400, "User not registered with email and password");
  }

  if (!user.verified) {
    throw new ApiError(403, "User not verified");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  user.refreshToken = refreshToken;

  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: user,
          accessToken,
        },
        "User logged in Successfully"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (email?.trim() === "" || !email) {
    throw new ApiError(400, "Email is Required");
  }

  const user = await User.findOne({ email: email }).select("email phoneNumber");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000);

  await Otp.deleteMany({ userId: user._id });

  await Otp.create({
    userId: user._id,
    otp: otpCode,
  });

  sendEmail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Reset Password",
    text: `Hello ${email}, Your OTP for verification is ${otpCode}`,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        email: email,
      },
      "OTP sent Succesfully"
    )
  );
});

const updatePassword = asyncHandler(async (req, res) => {
  const { extpassword, newpassword } = req.body;

  if (
    extpassword?.trim() === "" ||
    !extpassword ||
    newpassword?.trim() === "" ||
    !newpassword
  ) {
    throw new ApiError(400, "Current and New Password are Required");
  }

  console.log(req.user);

  const user = await User.findById(req.user._id).select("password email");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.isPasswordCorrect(extpassword);

  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newpassword;

  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Password Updated Successfully"
    )
  );
});

const verifyNewEmail = asyncHandler(async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail || newEmail.trim() === "") {
    throw new ApiError(400, "New Email is Required");
  }
  const user = User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const emailExist = await User.findOne({ email: newEmail });
  if (emailExist) {
    throw new ApiError(409, "User with this email already exists !");
  }
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  await Otp.deleteMany({ userId: req.user._id });

  await Otp.create({
    userId: req.user._id,
    otp: otpCode,
  });

  sendEmail({
    from: process.env.SMTP_EMAIL,
    to: newEmail,
    subject: "Verify OTP",
    text: `Hello ${newEmail}, Your OTP for verification is ${otpCode}`,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        email: newEmail,
      },
      "OTP sent Succesfully"
    )
  );
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!otp) {
    throw new ApiError(400, "OTP is Required");
  }
  if (!email || email.trim() === "") {
    throw new ApiError(400, "Email is Required");
  }
  const otpExist = await Otp.findOne({ userId: req.user._id });

  if (!otpExist) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpExist.otp !== Number(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  otpExist.verified = true;

  await otpExist.save();

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { email: email },
    { new: true }
  ).select("email phoneNumber name verified role");
  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: user,
          accessToken,
        },
        "User Verified & Updated Successfully"
      )
    );
});

const signInWithGoogle = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Invalid or Missing Token");
  }

  if (!client) {
    client = getOAuthClient();
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
  });

  const payload = ticket.getPayload();
  const { email, name } = payload;

  let user = await User.findOne({ email: email }).select("-password");

  if (!user) {
    //Signing Up
    const newUser = await User.create({
      email: email,
      name: name,
      verified: true,
    });
    await newUser.save();
    user = await User.findById(newUser._id).select(
      "email phoneNumber name verified role"
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );
  user.refreshToken = refreshToken;
  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: user,
          accessToken,
        },
        "User logged in Successfully"
      )
    );
});

const signInWithApple = asyncHandler(async (req, res) => {});

const signInWithLinkedin = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Code is Required");
  }

  const linkedinAccessToken = await getLinkedInAccessToken(code);
  const userDetails = await verifyLinkedInToken(linkedinAccessToken);

  let user = await User.findOne({ email: userDetails.email });

  if (!user) {
    user = await User.create({
      email: userDetails.email,
      name: userDetails.name,
      verified: true,
    }).select("email phoneNumber name verified role");

    await user.save();
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  user.refreshToken = refreshToken;

  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: user,
          accessToken,
        },
        "User logged in Successfully"
      )
    );
});

const signInWithFacebook = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    throw new ApiError(400, "Code is Required");
  }

  const facebookAccessToken = await getFacebookAccessToken(code);
  const userDetails = await verifyFacebookToken(facebookAccessToken);

  let user = await User.findOne({ email: userDetails.email });

  if (!user) {
    user = await User.create({
      email: userDetails.email,
      name: userDetails.name,
      verified: true,
    });

    await user.save();
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: user,
          accessToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
});

export {
  logoutUser,
  registerUser,
  registerInstructor,
  verifyOtp,
  verifyNewEmail,
  updateEmail,
  resendOtp,
  loginUser,
  forgotPassword,
  updatePassword,
  signInWithGoogle,
  signInWithApple,
  signInWithLinkedin,
  signInWithFacebook,
};
