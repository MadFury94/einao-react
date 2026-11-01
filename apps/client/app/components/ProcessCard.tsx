/**
 * ProcessCard - one step in the "How we work" process grid.
 *
 * Hover behaviour rules (per brief):
 *   - Only opacity, transform, background and color may change on hover/focus.
 *   - Padding, margin, height and font-size must never change.
 *   - The paragraph is always in the DOM (opacity + visibility) so screen
 *     readers can read it even when visually hidden.
 */
import type { ReactNode } from "react";

interface ProcessCardProps {
    number: string;   // "01", "02" ...
    title: string;
    description: string;
    /** Decorative background image URL. Alt text is always "" (image is decorative). */
    image: string;
}

export function ProcessCard({ number, title, description, image }: ProcessCardProps) {
    return (
        /* tabIndex="0" makes the card keyboard-focusable so :focus-visible works */
        <div className="process-card" tabIndex={0}>
            {/* Decorative background image - fades in on hover via CSS */}
            <img
                className="process-card-img"
                src={image}
                alt=""
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
            />

            {/* Dark gradient overlay - always present, ensures WCAG AA contrast */}
            <div className="process-card-overlay" aria-hidden="true" />

            {/* Lime top-accent bar - scales in on hover */}
            <div className="process-card-bar" aria-hidden="true" />

            <div className="process-card-body">
                {/* Step number - always visible */}
                <span className="process-card-num">{number}</span>

                {/* Heading - always visible, never moves */}
                <h3 className="process-card-title">{title}</h3>

                {/*
				 * Paragraph: always in the DOM for screen readers.
				 * Visually hidden when not hovered via opacity + visibility.
				 * Space is reserved so layout never shifts.
				 */}
                <p className="process-card-desc">{description}</p>
            </div>
        </div>
    );
}
