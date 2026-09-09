'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@restaurant/ui';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog 
      ref={dialogRef}
      className="backdrop:bg-black/50 open:animate-in open:zoom-in-95 open:fade-in-90 p-0 shadow-xl rounded-xl w-full max-w-md m-auto"
    >
      <div className="p-6 bg-white flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Sign In / Sign Up</h2>
          <button onClick={onClose} aria-label="Close Auth" className="text-gray-500 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Please enter your phone number or email to continue.
        </p>
        <input 
          type="text" 
          placeholder="Email or Phone" 
          className="w-full px-4 py-2 border rounded-md outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        />
        <Button variant="primary" className="w-full justify-center">
          Continue
        </Button>
      </div>
    </dialog>
  );
}
