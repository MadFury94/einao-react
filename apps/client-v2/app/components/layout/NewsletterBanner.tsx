import { useState } from "react";
import styles from "./NewsletterBanner.module.css";

export function NewsletterBanner() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) setSubmitted(true);
    };

    return (
        <section className={styles.wrap} aria-label="Newsletter signup">
            <div className={styles.card}>
                {/* Left blob — large organic purple shape */}
                <svg className={styles.blobLeft} viewBox="0 0 280 300" fill="none" aria-hidden="true">
                    <path d="M240 30 C290 80 300 160 260 220 C220 280 130 310 70 270 C10 230 -20 140 20 80 C60 20 140 -20 200 10 C220 18 230 22 240 30Z" fill="#3d2e8a" />
                </svg>

                {/* Right blob — large organic burgundy shape */}
                <svg className={styles.blobRight} viewBox="0 0 300 320" fill="none" aria-hidden="true">
                    <path d="M60 20 C10 70 -10 160 30 230 C70 300 170 330 230 290 C290 250 310 160 270 90 C230 20 150 -20 90 10 C78 15 68 15 60 20Z" fill="#7b1f5a" />
                </svg>

                <div className={styles.content}>
                    <h2 className={styles.heading}>Stay up to date with Einao</h2>
                    <p className={styles.subtitle}>
                        Be the first to know about new capabilities, case studies,
                        and announcements delivered straight to you.
                    </p>

                    {submitted ? (
                        <p className={styles.thanks}>Thanks — you're on the list.</p>
                    ) : (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <label htmlFor="newsletter-email" className="sr-only">
                                Your email address
                            </label>
                            <input
                                id="newsletter-email"
                                className={styles.input}
                                type="email"
                                placeholder="Your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className={styles.btn}>
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
