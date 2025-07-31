import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  label: string;
  initialValue?: string;
  submitText?: string;
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit, title, label, initialValue = '', submitText = '저장' }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      // Focus the input field when modal opens
      setTimeout(() => {
        const inputElement = document.getElementById('modal-input');
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    } else {
        // Optionally, show an error or just don't submit
        console.log("Input cannot be empty.");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 transform transition-all duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-xl font-bold text-slate-900">{title}</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" aria-label="닫기">
              <CloseIcon />
            </button>
          </div>
          <div className="mb-6">
            <label htmlFor="modal-input" className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              id="modal-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-slate-800 rounded-lg hover:bg-gray-300 transition-colors">
              취소
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-400" disabled={!value.trim()}>
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;
