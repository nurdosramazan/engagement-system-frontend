import React from 'react';

const Modal = ({ isOpen, onClose, title, children, size = '2xl' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`bg-white p-6 rounded-lg shadow-xl w-full ${sizeClasses[size] || 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
        < div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div >
  );
};

export default Modal;
