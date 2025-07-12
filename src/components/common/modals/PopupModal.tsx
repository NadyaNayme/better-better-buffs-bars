import React, { useState, useEffect, useRef } from 'react';

type PopupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title: string;
  placeholder?: string;
};

const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = 'Enter name...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      onClose();
    } else {
      alert('Name cannot be empty.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded shadow-lg w-80">
        <h3 className="text-xl mb-4 text-white-900">{title}</h3>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          onKeyDown={handleKeyDown}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;