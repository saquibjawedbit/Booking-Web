'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, Send, Smile, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      // Process any attachments to include base64 data
      const processedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const base64Data = await fileToBase64(attachment.file);
          return base64Data;
        })
      );
      // Send message with processed attachments
      onSendMessage(message, processedAttachments);
      setMessage('');
      setAttachments([]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Convert files to attachments with preview URLs
      const newAttachments = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file?.name,
        type: file.type,
        url: URL.createObjectURL(file),
        file,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  // Remove an attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  // Basic emoji picker options
  const emojiOptions = [
    '😊',
    '👍',
    '❤️',
    '🙏',
    '😂',
    '🎉',
    '👋',
    '🤔',
    '👌',
    '🔥',
  ];

  return (
    <div className="message-input-container">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100">
          <AnimatePresence>
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                className="relative group"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {attachment.type.startsWith('image/') ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={attachment.url}
                      alt={attachment?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-center p-1 border border-gray-200 bg-gray-50 shadow-sm">
                    <div className="text-2xl">📄</div>
                    <div className="text-[8px] text-gray-500 truncate w-full">
                      {attachment?.name}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center border border-white shadow-sm hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full py-2.5 pl-10 pr-12 rounded-full border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white/80 backdrop-blur-sm"
          />

          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <Smile size={18} />
            </button>
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <label className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
              <Paperclip size={18} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!message.trim() && attachments.length === 0}
          className={`
                        p-2.5 rounded-full shadow-sm flex items-center justify-center 
                        transition-all duration-200
                        ${
                          message.trim() || attachments.length > 0
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }
                    `}
        >
          <Send size={18} />
        </button>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <motion.div
          className="absolute bottom-16 left-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 flex flex-wrap gap-1 max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setMessage(message + emoji);
                setShowEmojiPicker(false);
              }}
              className="w-8 h-8 text-xl hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
