import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';

const ChatHeader = ({ friend, toggleSidebar, onClose }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div
      className="chat-header p-4 backdrop-blur-sm bg-white/70 border-b border-gray-200 flex justify-between items-center rounded-t-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={friend?.avatar} alt={friend?.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {getInitials(friend?.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-medium text-gray-900">
              {friend?.name || 'No Friend Selected'}
            </h2>
            {friend?.isOnline && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X size={18} className="text-gray-700" />
        </button>
      )}
    </motion.div>
  );
};

export default ChatHeader;
