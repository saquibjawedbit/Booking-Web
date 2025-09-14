import { getLanguage } from "../middlewares/language.middleware.js";
import { Item } from "../models/item.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
    translateObjectFields,
    translateObjectsFields,
} from "../utils/translation.js";

export const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = getLanguage(req); // Get language from middleware

  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  const item = await Item.findById(id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Translate item fields if language is not English
  const translatedItem = await translateObjectFields(
    item.toObject(),
    ["name", "description"],
    language
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Item fetched successfully", translatedItem));
});

export const discoverItems = asyncHandler(async (req, res) => {
  const { category, search, limit = 10, page = 1, advenureId } = req.query;
  const language = getLanguage(req); // Get language from middleware

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const queryObj = {};
  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }

  if (category) {
    queryObj.category = category;
  }

  if (advenureId) {
    queryObj.adventures = advenureId; // Filter by adventure ID
  }

  // Only fetch items that are available for rent or purchase
  queryObj.$or = [{ rentalStock: { $gt: 0 } }, { purchaseStock: { $gt: 0 } }];

  const items = await Item.find(queryObj)
    .populate("adventures", "name")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Item.countDocuments(queryObj);

  // Translate items if language is not English
  const translatedItems = await translateObjectsFields(
    items.map((item) => item.toObject()),
    ["name", "description", "category"],
    language
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { items: translatedItems, total },
        "Items fetched successfully"
      )
    );
});

export const createItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    rentalPrice,
    price,
    purchaseStock,
    rentalStock,
    category,
    adventures,
    purchase,
    rent,
  } = req.body;

  if (!name || !description || !category || !adventures || !purchase || !rent) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.files || !req.files.images || req.files.images.length === 0) {
    throw new ApiError(400, "Image is required");
  }

  const mediasUrl = await Promise.all(
    req.files.images.map(async (image) => {
      const link = await uploadOnCloudinary(image.path);
      return link.url;
    })
  );

  await Item.create({
    name,
    description,
    price,
    rentalPrice,
    rentalStock,
    purchaseStock,
    category,
    adventures,
    purchase,
    rent,
    images: mediasUrl,
    owner: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, "Item created successfully", {}));
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    purchaseStock,
    category,
    adventures,
    purchase,
    rent,
    rentalPrice,
    rentalStock,
  } = req.body;

  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  const item = await Item.findById(id);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Update fields if provided
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = price;
  if (purchaseStock !== undefined) item.purchaseStock = purchaseStock;
  if (category !== undefined) item.category = category;
  if (adventures !== undefined) item.adventures = adventures;
  if (purchase !== undefined) item.purchase = purchase;
  if (rent !== undefined) item.rent = rent;
  if (rentalPrice !== undefined) item.rentalPrice = rentalPrice;
  if (rentalStock !== undefined) item.rentalStock = rentalStock;

  // Handle images update
  if (req.files && req.files.images && req.files.images.length > 0) {
    // Delete old images from Cloudinary
    await Promise.all(
      item.images.map(async (image) => {
        await deleteFromCloudinary(image);
      })
    );
    // Upload new images
    const mediasUrl = await Promise.all(
      req.files.images.map(async (image) => {
        const link = await uploadOnCloudinary(image.path);
        return link.url;
      })
    );
    item.images = mediasUrl;
  }

  await item.save();

  res.status(200).json(new ApiResponse(200, "Item updated successfully", item));
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  const item = await Item.findByIdAndDelete(id);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  await Promise.all(
    item.images.map(async (image) => {
      const link = await deleteFromCloudinary(image);
    })
  );

  res.status(200).json(new ApiResponse(200, "Item deleted successfully", item));
});

export const getAllItems = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  const language = getLanguage(req); // Get language from middleware

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query object
  const queryObj = {};
  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }
  if (category) {
    queryObj.category = category;
  }

  const items = await Item.find(queryObj)
    .populate("adventures", "name")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Item.countDocuments(queryObj);

  // Translate items if language is not English
  const translatedItems = await translateObjectsFields(
    items.map((item) => item.toObject()),
    ["name", "description", "category"],
    language
  );

  res.json(
    new ApiResponse(200, "Items fetched successfully", translatedItems, total)
  );
});
