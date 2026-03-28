"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageItem {
    src: string;
    alt: string;
}

interface ImageLightboxProps {
    src: string;
    alt: string;
    className?: string;
    /** All images in the gallery for prev/next navigation */
    images?: ImageItem[];
    /** Index of this image within the images array */
    currentIndex?: number;
}

export function ImageLightbox({ src, alt, className, images, currentIndex }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewIndex, setViewIndex] = useState(currentIndex ?? 0);

    const hasGallery = images && images.length > 1;
    const displaySrc = hasGallery ? images[viewIndex].src : src;
    const displayAlt = hasGallery ? images[viewIndex].alt : alt;

    const close = useCallback(() => setIsOpen(false), []);

    const goNext = useCallback(() => {
        if (!images) return;
        setViewIndex((i) => (i + 1) % images.length);
    }, [images]);

    const goPrev = useCallback(() => {
        if (!images) return;
        setViewIndex((i) => (i - 1 + images.length) % images.length);
    }, [images]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (hasGallery && e.key === "ArrowRight") goNext();
            if (hasGallery && e.key === "ArrowLeft") goPrev();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, close, hasGallery, goNext, goPrev]);

    const handleOpen = () => {
        setViewIndex(currentIndex ?? 0);
        setIsOpen(true);
    };

    return (
        <>
            <img
                src={src}
                alt={alt}
                className={`${className ?? ""} cursor-zoom-in`}
                onClick={handleOpen}
            />
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={close}
                >
                    {/* Close button */}
                    <button
                        onClick={close}
                        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Counter */}
                    {hasGallery && (
                        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
                            {viewIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Prev button */}
                    {hasGallery && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goPrev(); }}
                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Image */}
                    <img
                        src={displaySrc}
                        alt={displayAlt}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next button */}
                    {hasGallery && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goNext(); }}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
