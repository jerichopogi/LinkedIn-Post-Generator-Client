// src/components/Notification.js
import React from 'react';

const Notification = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg">
      <p>{message}</p>
      <button
        onClick={onClose}
        className="mt-2 bg-white text-red-500 rounded px-4 py-1"
      >
        Close
      </button>
    </div>
  );
};

export default Notification;
