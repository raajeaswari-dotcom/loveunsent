import React from 'react';

interface CloudinaryImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
}

export function CloudinaryImage({ src, alt, className, width = 48, height = 48 }: CloudinaryImageProps) {
    const [error, setError] = React.useState(false);

    // Fallback placeholder image (gray placeholder SVG)
    const placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMjQgMjJDMjYuMjA5MSAyMiAyOCAyMC4yMDkxIDI4IDE4QzI4IDE1Ljc5MDkgMjYuMjA5MSAxNCAyNCAxNEMyMS43OTA5IDE0IDIwIDE1Ljc5MDkgMjAgMThDMjAgMjAuMjA5MSAyMS43OTA5IDIyIDI0IDIyWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0zNCAzMkgxNEMxNC41NTIzIDMyIDE1IDMxLjU1MjMgMTUgMzFDMTUgMjcuMTM0IDE4LjEzNCAyNCAyMiAyNEgyNkMyOS44NjYgMjQgMzMgMjcuMTM0IDMzIDMxQzMzIDMxLjU1MjMgMzMuNDQ3NyAzMiAzNCAzMloiIGZpbGw9IiM5Q0EzQUYiLz48L3N2Zz4=';

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-gray-400 text-xs">No image</span>
            </div>
        );
    }

    return (
        <img
            src={src || placeholderSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}
