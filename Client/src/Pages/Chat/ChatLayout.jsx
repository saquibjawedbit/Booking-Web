import { motion } from 'framer-motion';
import { MessageCircle, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { useFriend } from '../../hooks/useFriend';
import { ChatArea } from './ChatArea';

export const ChatLayout = () => {
  const { friends, fetchFriends } = useFriend();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetchFriends();

    // Hide sidebar on mobile by default
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    // Initial check
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleCloseChatClick = () => {
    setSelectedFriend(null);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-screen overflow-hidden flex">
      {/* Sidebar */}
      <motion.div
        className={`sidebar md:min-w-[320px] w-full md:w-[320px] md:relative absolute z-10 h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50 backdrop-blur-sm border-r border-gray-200`}
        initial={{ x: window.innerWidth < 768 ? -320 : 0 }}
        animate={{ x: showSidebar ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ maxWidth: '100vw' }}
      >
        <div className="sidebar-header p-5 border-b border-gray-200 bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Adventure Social
            </h2>
          </div>
        </div>

        <div className="p-5 flex items-center justify-between border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            <h2 className="text-lg font-medium text-gray-800">Friends</h2>
          </div>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-gray-200 bg-white/30">
          <div className="relative">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 pl-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-3 text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <motion.div
                key={friend._id}
                onClick={() => {
                  setSelectedFriend(friend);
                  if (window.innerWidth < 768) setShowSidebar(false);
                }}
                className={`p-4 flex gap-4 items-center cursor-pointer transition-all hover:bg-white/50 ${selectedFriend?._id === friend._id ? 'bg-white/60 border-l-4 border-indigo-500 pl-3' : 'border-l-4 border-transparent'}`}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={friend.profilePicture} alt={friend?.name} />
                  <AvatarFallback className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-medium">
                    {friend?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-800">
                    {friend?.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {friend.email}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 bg-white/30 m-4 rounded-lg">
              {searchQuery
                ? 'No friends match your search'
                : 'No friends found'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 w-full">
        <ChatArea
          selectedFriend={selectedFriend}
          toggleSidebar={toggleSidebar}
          onClose={handleCloseChatClick}
        />
      </div>
    </div>
  );
};
