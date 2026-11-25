import { useEffect, useRef, useState } from "react";
import { Link, useRouteLoaderData } from "react-router";
import type { loader as mainLoader } from "~/layouts/main";
import styles from "./HomeHero.module.css";

const VIDEO_SRC = "https://res.cloudinary.com/o9pk8cnf/video/upload/v1793927867/8275959-hd_1280_720_60fps.mp4";
const POSTER = "/assets/images/placeholder-hero-poster.webp";

export function HomeHero() {
    const mainData = useRouteLoaderData<typeof mainLoader>("layouts/main");
    const config = mainData?.home?.blocks?.find(block => block.block_type === "hero")?.config;
    const title = typeof config?.title === "string" && config.title.trim() ? config.title : "We build systems that keep organisations moving.";
    const subtitle = Array.isArray(config?.body) ? config.body.filter(value => typeof value === "string").join(" ") : "Technology consulting and digital delivery for organisations.";
    const poster = typeof config?.image === "string" && config.image ? config.image : POSTER;
    const videoSource = typeof config?.video === "string" && config.video ? config.video : VIDEO_SRC;
    const ctaLabel = typeof config?.ctaLabel === "string" && config.ctaLabel ? config.ctaLabel : "Explore our story";
    const ctaHref = typeof config?.ctaHref === "string" && config.ctaHref ? config.ctaHref : "/about/";
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
                    src={poster}
                    alt=""
                    width="1920"
                    height="1080"
                    fetchPriority="high"
                />
                {!videoFailed && (
                    <video
                        ref={video}
                        className={styles.video}
                        src={videoSource}
                        poster={poster}
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
                        {title}
                    </h1>
                    <p className={styles.subtitle}>
                        {subtitle}
                    </p>
                    <div className={styles.actions}>
                        <Link to={ctaHref} className={styles.btn}>
                            {ctaLabel}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
