import { AnimatePresence, motion } from 'framer-motion';
import { EMPTY_STATES } from '../../../constants/chatConstants';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';

const MessageContainer = ({
  messages,
  loading,
  error,
  userId,
  user,
  friend,
  messageEndRef,
}) => {
  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error === 'No message found') {
    return (
      <EmptyState
        title={EMPTY_STATES.NO_MESSAGES.title}
        description={EMPTY_STATES.NO_MESSAGES.description}
        friendName={friend?.name}
      />
    );
  }

  if (!messages.length) {
    return (
      <EmptyState
        title={EMPTY_STATES.START_CONVERSATION.title}
        description={EMPTY_STATES.START_CONVERSATION.description}
      />
    );
  }

  return (
    <motion.div
      className="space-y-4 w-full max-w-full mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div ref={messageEndRef} />
      <AnimatePresence>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            userId={userId}
            currentUser={user?.user}
            friendData={friend}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessageContainer;
