import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import styles from "./HomeHero.module.css";

const VIDEO_SRC = "https://res.cloudinary.com/o9pk8cnf/video/upload/v1793927867/8275959-hd_1280_720_60fps.mp4";
const POSTER = "/assets/images/placeholder-hero-poster.webp";

export function HomeHero() {
    const video = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        const media = video.current;
        if (!media) return;

        const preference = matchMedia("(prefers-reduced-motion: reduce)");
        let visible = true;

        const update = () => {
            if (preference.matches || !visible || document.hidden) {
                media.pause();
            } else {
                void media.play().catch(() => { });
            }
        };

        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            update();
        });
        observer.observe(media);
        preference.addEventListener("change", update);
        document.addEventListener("visibilitychange", update);
        update();

        return () => {
            observer.disconnect();
            preference.removeEventListener("change", update);
            document.removeEventListener("visibilitychange", update);
            media.pause();
        };
    }, []);

    return (
        <section className={styles.hero} aria-labelledby="hero-heading">
            {/* Background */}
            <div className={styles.media}>
                <img
                    className={styles.poster}
                    src={POSTER}
                    alt=""
                    width="1920"
                    height="1080"
                    fetchPriority="high"
                />
                {!videoFailed && (
                    <video
                        ref={video}
                        className={styles.video}
                        src={VIDEO_SRC}
                        poster={POSTER}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                        tabIndex={-1}
                        onError={() => setVideoFailed(true)}
                    />
                )}
                <div className={styles.overlay} aria-hidden="true" />
            </div>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.inner}>
                    <h1 id="hero-heading" className={styles.heading}>
                        We build systems that<br />
                        keep organisations moving.
                    </h1>
                    <p className={styles.subtitle}>
                        Technology consulting and digital delivery for organisations.
                    </p>
                    <div className={styles.actions}>
                        <Link to="/about/" className={styles.btn}>
                            Explore our story
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
