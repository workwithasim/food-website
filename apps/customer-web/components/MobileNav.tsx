'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
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
      className="m-0 h-full max-h-none w-3/4 max-w-sm backdrop:bg-black/50 open:animate-in open:slide-in-from-left open:fade-in-90 p-0 shadow-lg"
    >
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-xl font-bold text-rose-600">BrandFood</span>
          <button onClick={onClose} aria-label="Close Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-4">
          <Link href="/" onClick={onClose} className="text-lg font-medium">Menu</Link>
          <Link href="/deals" onClick={onClose} className="text-lg font-medium">Deals</Link>
          <Link href="/orders" onClick={onClose} className="text-lg font-medium">Orders</Link>
        </nav>
      </div>
    </dialog>
  );
}
