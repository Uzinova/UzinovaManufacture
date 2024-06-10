// src/Notification.js
import React, { useState, useEffect } from 'react';
import './Notification.css'; // optional, for styling

const Notification = ({ message, show, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // Hide notification after `duration` milliseconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      // Cleanup timer on component unmount or when `show` changes
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration]);

  return (
    <div className={`notification ${isVisible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
