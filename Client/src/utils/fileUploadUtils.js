/**
 * Utility functions for handling file uploads in the chat
 */

/**
 * Creates a data URL from a file
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves to the data URL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error initializing file read:', error);
      reject(error);
    }
  });
};

/**
 * Uploads a file to the server (simulation)
 * In a real app, this would call an API endpoint to upload the file to a server
 *
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, name: string, type: string, size: number}>} - A promise that resolves to the file metadata
 */
export const uploadFile = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Starting file upload for:', file?.name);

    // In a real app, you would use fetch or axios to upload the file to a server
    // For now, we'll simulate an upload by creating a data URL
    const dataURL = await fileToDataURL(file);

    if (!dataURL) {
      throw new Error('Failed to generate data URL');
    }

    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('File upload completed successfully');

    return {
      url: dataURL, // In a real app, this would be the URL returned by the server
      name: file?.name,
      type: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Check if a file is an image based on its MIME type
 * @param {string} fileType - The MIME type of the file
 * @returns {boolean} - Whether the file is an image
 */
export const isImageFile = (fileType) => {
  return fileType.startsWith('image/');
};

/**
 * Debug helper for troubleshooting file browser issues
 * @param {string} action - The action being performed
 * @param {Object} data - Any relevant data to log
 */
export const debugFileUpload = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] FILE UPLOAD - ${action}:`, data);
};
