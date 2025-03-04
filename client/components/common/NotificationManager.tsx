import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationManager: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getTypeClasses = (type: string) => {
    const baseClasses = 'px-4 py-2 rounded-md shadow-lg mb-2 text-white';
    switch (type) {
      case 'success': return `${baseClasses} bg-green-500`;
      case 'error': return `${baseClasses} bg-red-500`;
      case 'warning': return `${baseClasses} bg-yellow-500`;
      default: return `${baseClasses} bg-blue-500`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-72">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={getTypeClasses(notification.type)}
            onClick={() => removeNotification(notification.id)}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManager;