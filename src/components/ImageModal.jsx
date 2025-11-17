"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function ImageModal({ images = [], initialIndex = 0, open, onOpenChange }) {
  const [index, setIndex] = useState(initialIndex || 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setIndex(initialIndex || 0);
  }, [open, initialIndex]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const onKeyDown = useCallback((e) => {
    if (!open) return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') onOpenChange(false);
  }, [open, prev, next, onOpenChange]);

  useEffect(() => {
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onKeyDown]);

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-center">Images</DialogTitle>
        </DialogHeader>

        <div className="relative flex items-center justify-center bg-gray-900/5 rounded">
          <div className="absolute left-2 z-20">
            <Button variant="ghost" onClick={prev} className="p-2">
              <ChevronLeft />
            </Button>
          </div>

          <div className="max-h-[70vh] w-full flex items-center justify-center">
            <div className="relative w-full h-[60vh] flex items-center justify-center">
              <Image
                src={images[index]}
                alt={`image-${index}`}
                fill={false}
                width={410}
                height={300}
                className="object-contain mx-auto"
              />
            </div>
          </div>

          <div className="absolute right-2 z-20">
            <Button variant="ghost" onClick={next} className="p-2">
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-2 overflow-x-auto">
          {images.map((src, i) => (
            <button key={src} onClick={() => setIndex(i)} className={`border ${i === index ? 'border-blue-500' : 'border-transparent'} rounded` }>
              <div style={{ width: 80, height: 'fit-content', position: 'relative' }}>
                <Image src={src} alt={`thumb-${i}`} width={80} height={60} className="object-cover" />
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <div className="w-full flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
