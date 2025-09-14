const { Translate } = (await import("@google-cloud/translate")).v2;
import dotenv from "dotenv";
import redis from "../config/redis.config.js";
await dotenv.config();

// Initialize Google Translate client
// For production, you should set up proper authentication with a service account key
// For now, we'll use the API key method (less secure but simpler for development)
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY, // Add this to your .env file
});

/**
 * Translates text to the specified target language with Redis caching
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (
  text,
  targetLanguage,
  sourceLanguage = "en"
) => {
  // Return original text if target language is the same as source
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  // Create cache key
  const cacheKey = `translate:${sourceLanguage}:${targetLanguage}:${Buffer.from(
    text
  ).toString("base64")}`;
  try {
    // Check if translation exists in cache
    const cachedTranslation = await redis.get(cacheKey);
    if (cachedTranslation) {
      return cachedTranslation;
    }

    // If not in cache, translate using Google Translate API
    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    // Cache the translation for 24 hours
    await redis.setEx(cacheKey, 86400, translation);
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Translates multiple texts to the specified target language with Redis caching
 * Uses batch processing for better performance
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateTexts = async (
  texts,
  targetLanguage,
  sourceLanguage = "en"
) => {
  // Return original texts if target language is the same as source
  if (targetLanguage === sourceLanguage) {
    return texts;
  }

  const results = [];
  const textsToTranslate = [];
  const indexes = [];

  // Check cache for each text
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const cacheKey = `translate:${sourceLanguage}:${targetLanguage}:${Buffer.from(
      text
    ).toString("base64")}`;

    try {
      const cachedTranslation = await redis.get(cacheKey);
      if (cachedTranslation) {
        results[i] = cachedTranslation;
      } else {
        textsToTranslate.push(text);
        indexes.push(i);
      }
    } catch (error) {
      console.error("Cache error:", error);
      textsToTranslate.push(text);
      indexes.push(i);
    }
  }

  // Translate uncached texts in batches
  if (textsToTranslate.length > 0) {
    try {
      const batchSize = 50; // Google Translate API limit
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);
        const batchIndexes = indexes.slice(i, i + batchSize);

        const [translations] = await translate.translate(batch, {
          from: sourceLanguage,
          to: targetLanguage,
        });

        // Cache and store results
        for (let j = 0; j < batch.length; j++) {
          const translation = Array.isArray(translations)
            ? translations[j]
            : translations;
          const originalIndex = batchIndexes[j];
          results[originalIndex] = translation; // Cache the translation
          const cacheKey = `translate:${sourceLanguage}:${targetLanguage}:${Buffer.from(
            batch[j]
          ).toString("base64")}`;
          try {
            await redis.setEx(cacheKey, 86400, translation);
          } catch (error) {
            console.error("Cache storage error:", error);
          }
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      // Fall back to original texts for failed translations
      for (const index of indexes) {
        if (!results[index]) {
          results[index] = texts[index];
        }
      }
    }
  }

  return results;
};

/**
 * Translates an object's specified fields to the target language
 * Also handles nested populated fields like adventures?.name
 * @param {Object} obj - Object to translate
 * @param {string[]} fieldsToTranslate - Array of field names to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<Object>} - Object with translated fields
 */
export const translateObjectFields = async (
  obj,
  fieldsToTranslate,
  targetLanguage,
  sourceLanguage = "en"
) => {
  // Return original object if target language is the same as source
  if (targetLanguage === sourceLanguage) {
    return obj;
  }

  // Create a deep copy of the object to avoid mutating the original
  const translatedObj = JSON.parse(JSON.stringify(obj));

  for (const field of fieldsToTranslate) {
    if (obj[field] && typeof obj[field] === "string") {
      translatedObj[field] = await translateText(
        obj[field],
        targetLanguage,
        sourceLanguage
      );
    } else if (obj[field] && Array.isArray(obj[field])) {
      // Handle arrays of strings
      translatedObj[field] = await translateTexts(
        obj[field],
        targetLanguage,
        sourceLanguage
      );
    }
  }

  return translatedObj;
};

/**
 * Translates an array of objects' specified fields to the target language
 * Also handles nested populated fields like adventures?.name
 * @param {Object[]} objects - Array of objects to translate
 * @param {string[]} fieldsToTranslate - Array of field names to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<Object[]>} - Array of objects with translated fields
 */
export const translateObjectsFields = async (
  objects,
  fieldsToTranslate,
  targetLanguage,
  sourceLanguage = "en"
) => {
  // Return original objects if target language is the same as source
  if (targetLanguage === sourceLanguage) {
    return objects;
  }

  const translatedObjects = [];

  for (const obj of objects) {
    const translatedObj = await translateObjectFields(
      obj,
      fieldsToTranslate,
      targetLanguage,
      sourceLanguage
    );

    translatedObjects.push(translatedObj);
  }

  return translatedObjects;
};

/**
 * Clears translation cache for a specific text or pattern
 * @param {string} pattern - Pattern to match cache keys (optional)
 */
export const clearTranslationCache = async (pattern = null) => {
  try {
    if (pattern) {
      const keys = await redis.keys(`translate:*${pattern}*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      const keys = await redis.keys("translate:*");
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  } catch (error) {
    console.error("Error clearing translation cache:", error);
  }
};

/**
 * Gets supported languages from Google Translate
 * @returns {Promise<Object[]>} - Array of supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    const [languages] = await translate.getLanguages();
    return languages;
  } catch (error) {
    console.error("Error getting supported languages:", error);
    return [];
  }
};
