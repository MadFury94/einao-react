/**
 * EditorialImage - reusable image treatment used across the site.
 *
 * Applies the Einao look: slight desaturation, a dark-green tint overlay,
 * and a soft gradient at the bottom. All values use CSS variables so one
 * token change updates every instance.
 *
 * DOM order: image comes after heading in source for screen readers, but is
 * placed visually on the left via CSS grid in the parent layout.
 */
import { useState } from "react";

interface EditorialImageProps {
    src: string;
    alt: string;
    /** CSS aspect-ratio string, e.g. "4/5" */
    ratio?: string;
    /** When true, sets loading="eager" for above-the-fold images. */
    priority?: boolean;
    fallbackLabel?: string;
}

export function EditorialImage({
    src,
    alt,
    ratio = "4/5",
    priority = false,
    fallbackLabel,
}: EditorialImageProps) {
    const [failed, setFailed] = useState(false);
    return (
        <div
            className={`editorial-image${failed ? " is-fallback" : ""}`}
            style={{ "--ei-ratio": ratio } as React.CSSProperties}
        >
            {failed ? <div className="editorial-image-fallback" role="img" aria-label={alt}>{fallbackLabel ?? "Einao"}</div> : <img
                src={src}
                alt={alt}
                onError={() => setFailed(true)}
                /* width/height are overridden by aspect-ratio CSS; these
                   values prevent layout shift before styles are applied */
                width={800}
                height={1000}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
            />}
            {/* Dark green tint + bottom gradient - defined in CSS using tokens */}
            <div className="editorial-image-tint" aria-hidden="true" />
        </div>
    );
}

// React is needed for the CSSProperties cast above
import React from "react";
