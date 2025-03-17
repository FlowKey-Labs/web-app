import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center'
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className='bg-white rounded-2xl p-6 min-w-[500px]'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
