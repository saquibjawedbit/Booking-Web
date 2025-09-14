import { getLanguage } from "../middlewares/language.middleware.js";
import { Adventure } from "../models/adventure.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { translateObjectFields, translateObjectsFields } from "../utils/translation.js";

export const getAllAdventure = asyncHandler(async (req, res) => {
  const language = getLanguage(req);
  
  const adventuresData = await Adventure.find().populate("location");
  
  // Convert to plain objects
  const plainAdventures = adventuresData.map(adventure => adventure.toJSON());
  
  let adventures;
  // Translate adventure names if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['name'];
    adventures = await translateObjectsFields(plainAdventures, fieldsToTranslate, language);
  } else {
    adventures = plainAdventures;
  }

  return res.status(200).json({
    adventures,
  });
});

export const createAdventure = asyncHandler(async (req, res) => {
  const { name, description, location, exp } = req.body;
  if (!name || !description || !location || !exp) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    !req.files ||
    !req.files.medias ||
    req.files.medias.length <= 0 ||
    !req.files.medias[0]
  ) {
    throw new ApiError(400, "Image is required");
  }

  // Save image to cloudinary
  const mediasUrl = await Promise.all(
    req.files.medias.map(async (image) => {
      const link = await uploadOnCloudinary(image.path);
      return link.url;
    })
  );

  let thumbnailUrl = "";
  let previewVideoUrl = "";

  if (req.files.thumbnail && req.files.thumbnail[0]) {
    const thumbnailUpload = await uploadOnCloudinary(
      req.files.thumbnail[0].path
    );
    thumbnailUrl = thumbnailUpload.url;
  }

  if (req.files.previewVideo && req.files.previewVideo[0]) {
    const previewVideoUpload = await uploadOnCloudinary(
      req.files.previewVideo[0].path
    );
    previewVideoUrl = previewVideoUpload.url;
  }
  let locationsArray = location;
  if (typeof location === "string" && location.includes(",")) {
    locationsArray = location.split(",");
  } else if (!Array.isArray(location)) {
    locationsArray = [location];
  }

  const newAdventure = await Adventure.create({
    name,
    description,
    location: locationsArray,
    medias: mediasUrl,
    thumbnail: thumbnailUrl,
    previewVideo: previewVideoUrl,
    exp,
  });
  await newAdventure.save();

  res
    .status(201)
    .json(new ApiResponse(201, newAdventure, "Adventure created successfully"));
});

export const updateAdventure = asyncHandler(async (req, res) => {
  const { name, description, location, date, medias, exp, instructor } =
    req.body;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Adventure id is required");
  }

  const adventure = await Adventure.findById(id);

  if (!adventure) {
    throw new ApiError(404, "Adventure not found");
  }

  //   if (adventure.instructor !== req.user._id) {
  //     throw new ApiError(403, "Unauthorized request");
  //   }

  if (req.files.medias && req.files.medias.length > 0 && req.files.medias[0]) {
    // Save image to cloudinary
    const mediasUrl = await Promise.all(
      req.files.medias.map(async (image) => {
        const link = await uploadOnCloudinary(image.path);
        return link.url;
      })
    );

    const oldMediaUrl = adventure.medias;

    // Delete old images from cloudinary
    await Promise.all(
      oldMediaUrl.map(async (url) => {
        await deleteFromCloudinary(url);
      })
    );

    adventure.medias = mediasUrl;
  }

  adventure.name = name || adventure?.name;
  adventure.description = description || adventure.description;
  adventure.location = location || adventure.location;
  adventure.date = date || adventure.date;
  adventure.exp = exp || adventure.exp;
  adventure.instructor = instructor || adventure.instructor;

  await adventure.save();

  res
    .status(200)
    .json(new ApiResponse(200, adventure, "Adventure updated successfully"));
});

export const deleteAdventure = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError("Adventure ID is required");
  }

  const adventure = await Adventure.findById(id);

  if (!adventure) {
    throw new ApiError("Adventure with this ID does not exist");
  }

  //   if (adventure.instructor !== req.user._id) {
  //     throw new ApiError(403, "Unauthorized request");
  //   }

  const medias = adventure.medias;

  await Promise.all(
    medias.map(async (url) => {
      await deleteFromCloudinary(url);
    })
  );

  await Adventure.deleteOne({ _id: id });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Adventure deleted successfully"));
});

export const getAdventure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = getLanguage(req);

  if (!id) {
    throw new ApiError(400, "Adventure id is required");
  }

  const adventureData = await Adventure.findById(id).populate("location");

  if (!adventureData) {
    throw new ApiError(404, "Adventure not found");
  }

  // Convert to plain object
  const plainAdventure = adventureData.toJSON();
  
  let adventure;
  // Translate adventure name if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['name'];
    adventure = await translateObjectFields(plainAdventure, fieldsToTranslate, language);
  } else {
    adventure = plainAdventure;
  }

  return res.status(200).json(adventure);
});

export const getInstructorAdventures = asyncHandler(async (req, res) => {
  const language = getLanguage(req);
  
  const adventuresData = await Adventure.find({ instructor: req.user._id });
  
  // Convert to plain objects
  const plainAdventures = adventuresData.map(adventure => adventure.toJSON());
  
  let adventures;
  // Translate adventure names if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['name'];
    adventures = await translateObjectsFields(plainAdventures, fieldsToTranslate, language);
  } else {
    adventures = plainAdventures;
  }
  
  return res.status(200).json(adventures);
});

export const getFilteredAdventures = asyncHandler(async (req, res) => {
  const { adventure, location, session_date } = req.query;
  const language = getLanguage(req);

  const date = new Date(session_date);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  // Step 1: Find sessions within the date range
  let sessions = await Session.find({
    startTime: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate({
      path: "adventureId",
      match: adventure ? { name: { $regex: adventure, $options: "i" } } : {}, // filter here
    })
    .populate({
      path: "location",
      match: location ? { name: { $regex: location, $options: "i" } } : {}, // filter here
    });

  // Step 2: Filter out sessions where populate returned null
  sessions = sessions.filter(
    (session) => session.adventureId && session.location
  );

  // Step 3: Extract unique adventure IDs
  const adventureIds = sessions.map((session) => session.adventureId._id);
  const uniqueAdventureIds = [
    ...new Set(adventureIds.map((id) => id.toString())),
  ];

  // Step 4: Fetch adventures with populated location data
  const adventuresData = await Adventure.find({
    _id: { $in: uniqueAdventureIds },
  }).populate("location");

  // Convert to plain objects
  const plainAdventures = adventuresData.map(adventure => adventure.toJSON());
  
  let adventures;
  // Translate adventure names if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['name'];
    adventures = await translateObjectsFields(plainAdventures, fieldsToTranslate, language);
  } else {
    adventures = plainAdventures;
  }

  // Response
  res.status(200).json({ data: adventures, total: adventures.length });
});
