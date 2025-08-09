import express from "express";
import { getCartItems, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { languageMiddleware } from "../middlewares/language.middleware.js";

const router = express.Router();

// All routes require authentication and language detection
router.use(verifyJWT);
router.use(languageMiddleware);

// Get current user's cart
router.get("/", getCartItems);

// Add item to cart
router.post("/add", addToCart);

// Update item in cart (quantity, rentalPeriod, purchase)
router.put("/update", updateCartItem);

// Remove item from cart
router.put("/remove", removeCartItem);

// Clear all items from cart
router.delete("/clear", clearCart);

export default router;
