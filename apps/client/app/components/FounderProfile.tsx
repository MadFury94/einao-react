/**
 * FounderProfile - two-column layout for the founder section.
 *
 * Portrait side uses EditorialImage for consistent desaturation/tint treatment.
 * On mobile the columns stack (portrait first, text second via flex-direction).
 *
 * Props are all explicit so callers read like self-documentation.
 */
import { EditorialImage } from "./EditorialImage";

export interface FounderProfileProps {
    /** Path to the portrait image, e.g. "/assets/images/founder.webp" */
    image: string;
    /** Descriptive alt text for the portrait - never decorative for a named person */
    alt: string;
    /** e.g. "Founder" */
    role: string;
    /** Full name, e.g. "Collins Nkwoji" */
    name: string;
    /** Credential string, e.g. "MBA, CPA, FCA, FCIT" */
    credentials: string;
    /** Optional bio paragraph */
    bio?: string;
}

export function FounderProfile({
    image,
    alt,
    role,
    name,
    credentials,
    bio,
}: FounderProfileProps) {
    return (
        /* founder-profile grid: portrait (4:5, ~360px) left, text right.
           grid-template-columns set in CSS so breakpoints live in one place. */
        <div className="founder-profile">
            {/* Portrait column - EditorialImage applies site desaturation + dark-green tint */}
            <div className="founder-profile-portrait">
                <EditorialImage src={image} alt={alt} ratio="4/5" fallbackLabel="CN" priority />
            </div>

            {/* Text column */}
            <div className="founder-profile-text">
                {/* Role label in small-caps forest green - same pattern as .eyebrow */}
                <p className="founder-profile-role">{role}</p>

                {/* Name as a heading so screen readers navigate to it */}
                <h3 className="founder-profile-name">{name}</h3>

                {/* Credentials - uses --ink at 64% opacity to hit WCAG AA on --paper */}
                <p className="founder-profile-credentials">{credentials}</p>

                {bio && <p className="founder-profile-bio">{bio}</p>}
            </div>
        </div>
    );
}
