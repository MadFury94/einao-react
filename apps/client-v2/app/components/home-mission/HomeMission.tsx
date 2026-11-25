import { useRouteLoaderData } from "react-router";
import type { loader as mainLoader } from "~/layouts/main";
import styles from "./HomeMission.module.css";

export function HomeMission() {
    const mainData = useRouteLoaderData<typeof mainLoader>("layouts/main");
    const config = mainData?.home?.blocks?.find(block => block.block_type === "mission")?.config;
    const title = typeof config?.title === "string" && config.title.trim() ? config.title : "Turning possibilities into everyday impact.";
    const body = Array.isArray(config?.body) ? config.body.filter(value => typeof value === "string").join(" ") : "We understand your operational requirement first then define and deliver the right technology response.";
    const image = typeof config?.image === "string" && config.image ? config.image : "/assets/images/about hero/Einao Profiles in emerald light.png";
    const imageAlt = typeof config?.imageAlt === "string" && config.imageAlt ? config.imageAlt : "Einao team collaborating";
    return (
        <section className={styles.section} aria-labelledby="mission-heading">
            <div className={styles.inner}>
                {/* Text block — centered */}
                <div className={styles.text}>
                    <h2 id="mission-heading" className={styles.heading}>
                        {title}
                    </h2>
                    <p className={styles.body}>
                        {body}
                    </p>
                </div>

                {/* Image */}
                <div className={styles.imageWrap}>
                    <img
                        className={styles.image}
                        src={image}
                        alt={imageAlt}
                        width="1200"
                        height="580"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
}
