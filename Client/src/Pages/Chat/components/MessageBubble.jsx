import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCheck } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import { isMessageFromUser } from '../../../utils/chatHelpers';

const MessageBubble = ({ message, userId, currentUser, friendData }) => {
  const isSender = isMessageFromUser(message, userId);
  const messageUser = isSender ? currentUser : friendData;

  // Format the timestamp
  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), 'h:mm a')
    : '';

  // Get the first letter of the name for avatar fallback
  const getInitial = (user) => {
    if (!user?.name) return '?';
    return user?.name.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      {!isSender && (
        <div className="flex-shrink-0 mr-2">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
            <AvatarImage
              src={messageUser?.profilePicture || '/placeholder.svg'}
              alt={messageUser?.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
              {getInitial(messageUser)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div
        className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-[70%] md:max-w-[60%] lg:max-w-[50%]`}
      >
        <div
          className={`
                        relative px-4 py-2 rounded-2xl shadow-sm backdrop-blur-sm
                        ${
                          isSender
                            ? 'bg-gradient-to-r from-blue-400/90 to-indigo-500/90 text-white rounded-tr-none'
                            : 'bg-white/90 text-gray-800 rounded-tl-none border border-gray-100'
                        }
                    `}
        >
          {/* Message text content */}
          {(message.content || message.text) && (
            <p className="m-0 whitespace-pre-wrap text-sm">
              {message.content || message.text}
            </p>
          )}

          {/* Message attachments - legacy format */}
          {message.attachments && message.attachments.length > 0 && (
            <div
              className={`flex flex-wrap gap-2 ${message.content || message.text ? 'mt-2' : ''}`}
            >
              {message.attachments.map((base64Image, attachmentIndex) => (
                <div
                  key={attachmentIndex}
                  className="relative overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={base64Image || '/placeholder.svg'}
                    alt={`Image ${attachmentIndex + 1}`}
                    className="max-w-full max-h-60 object-contain bg-black/5"
                    loading="lazy"
                    onClick={() => window.open(base64Image, '_blank')}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* New single attachment format */}
          {message.attachment && (
            <div className={`${message.content || message.text ? 'mt-2' : ''}`}>
              {message.attachment.type &&
              message.attachment.type.startsWith('image/') ? (
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={message.attachment.url || '/placeholder.svg'}
                    alt={message.attachment?.name || 'Image attachment'}
                    className="max-w-full max-h-60 object-contain bg-black/5"
                    loading="lazy"
                    onClick={() =>
                      window.open(message.attachment.url, '_blank')
                    }
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <div
                  className={`
                                    file-attachment p-3 rounded-lg flex items-center
                                    ${isSender ? 'bg-blue-600/30' : 'bg-gray-100'}
                                `}
                >
                  <div className="file-icon mr-3 text-2xl">📄</div>
                  <div className="file-info flex-1 overflow-hidden">
                    <div className="file-name font-medium text-sm truncate">
                      {message.attachment?.name}
                    </div>
                    <div className="file-size text-xs text-gray-500">
                      {(message.attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  {message.attachment.url && (
                    <a
                      href={message.attachment.url}
                      download={message.attachment?.name}
                      className={`
                                                download-button ml-2 p-1.5 rounded-full 
                                                ${isSender ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}
                                                hover:opacity-80 transition-opacity
                                            `}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp and read receipt */}
        <div
          className={`flex items-center text-xs text-gray-500 mt-1 opacity-70 group-hover:opacity-100 transition-opacity ${isSender ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span className="mx-1">{formattedTime}</span>

          {isSender && <CheckCheck size={14} className="text-blue-500" />}
        </div>
      </div>

      {isSender && (
        <div className="flex-shrink-0 ml-2">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
            <AvatarImage
              src={messageUser?.profilePicture || '/placeholder.svg'}
              alt={messageUser?.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {getInitial(messageUser)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
