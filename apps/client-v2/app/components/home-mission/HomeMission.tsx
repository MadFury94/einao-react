import styles from "./HomeMission.module.css";

export function HomeMission() {
    return (
        <section className={styles.section} aria-labelledby="mission-heading">
            <div className={styles.inner}>
                {/* Text block — centered */}
                <div className={styles.text}>
                    <h2 id="mission-heading" className={styles.heading}>
                        Turning possibilities into everyday impact.
                    </h2>
                    <p className={styles.body}>
                        We understand your operational requirement first
                        then define and deliver the right technology response.
                    </p>
                </div>

                {/* Image */}
                <div className={styles.imageWrap}>
                    <img
                        className={styles.image}
                        src="/assets/images/about hero/Einao Profiles in emerald light.png"
                        alt="Einao team collaborating"
                        width="1200"
                        height="580"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
}
