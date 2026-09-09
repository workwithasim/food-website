'use client';
import { useState } from 'react';

interface DangerousActionModalProps {
  title: string;
  description: string;
  confirmationText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function DangerousActionModal({ title, description, confirmationText, onConfirm, onCancel, isOpen }: DangerousActionModalProps) {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="font-bold">{confirmationText}</span> to confirm
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={confirmationText}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== confirmationText}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              input === confirmationText ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
}
