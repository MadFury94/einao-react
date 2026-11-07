import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import type { BlockConfig, Page } from '@einao/content';
import { workNeighbours, type WorkEntry } from '../lib/work';
import { ArrowIcon } from './ArrowIcon';
import { ConnectedSystems } from './ConnectedSystems';
import { Reveal } from './primitives';
import { PageHero } from './page-blocks';
import './work-pages.css';

const fallbackImages = [
  '/assets/images/Collaborative technology team in Abuja office.png',
  '/assets/images/Einao staff working on automation with client.jpg',
  '/assets/images/Nigerian IT Consultants Reviewing a Laptop.png',
  '/assets/images/Team Navigates Pending Approvals.png',
  '/assets/images/Graphite monitor with enterprise dashboard.png',
];

const fallbackImage = '/assets/images/placeholder-card-1.webp';

function ProjectImage({ src, alt = '', className = '', priority = false }: { src: string; alt?: string; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const shift = Math.max(-bounds.height * .07, Math.min(bounds.height * .07, (innerHeight / 2 - bounds.top - bounds.height / 2) * .2));
      element.style.setProperty('--project-shift', motion.matches ? '0px' : `${shift}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); motion.removeEventListener('change', schedule); };
  }, [src]);
  return <div ref={ref} className={`work-parallax ${className}`}><img src={src} alt={alt} width="1600" height="1000" loading={priority ? 'eager' : 'lazy'} /></div>;
}

// WorkHeading is kept for the detail page only
function WorkHeading({ title }: { title: string }) {
  const words = title.split(' ');
  const split = Math.ceil(words.length / 2);
  return (
    <header className="work-breadcrumb">
      <div className="work-container">
        <h1><em>{words.slice(0, split).join(' ')}</em>{' '}{words.slice(split).join(' ')}</h1>
        <div className="work-breadcrumb-bottom">
          <div><span>Einao Solutions</span><span>Selected case study</span></div>
          <h2>Overview</h2>
        </div>
      </div>
    </header>
  );
}

export function WorkListing({ page, entries }: { page: Page; entries: WorkEntry[] }) {
  const heroConfig = page.blocks.find(block => block.block_type === 'hero')?.config;
  const title = heroConfig?.title || page.title;
  const year = new Date().getFullYear();

  // Split into two staggered columns — Orixo solutions-card style
  const left = entries.filter((_, i) => i % 2 === 0);
  const right = entries.filter((_, i) => i % 2 === 1);

  return (
    <div className="work-reference work-listing-page">
      {/* ── Hero ── */}
      <PageHero
        eyebrow="01 / Our work"
        title={title}
        accent={heroConfig?.accent}
        pageLabel="Our Work"
        metaLines={['Case studies and selected engagements', heroConfig?.body?.[0] ?? ''].filter(Boolean)}
        bgImage="/assets/images/about hero/DEinao ata Center Team Troubleshooting Together (1).png"
        typewriterWords={['Consulting.', 'Automating.', 'Building.', 'Delivering.']}
        secondaryLink={{ label: 'Start a conversation', href: '/contact/' }}
      />

      {/* ── Showcase grid — same Orixo card style as solutions page ── */}
      {entries.length > 0 && (
        <section className="section solutions-grid-section">
          <div className="container solutions-grid-container">
            <div className="solutions-grid">
              <div className="solutions-col">
                {left.map((entry, i) => (
                  <Reveal key={entry.link!.href} direction="left" className="solutions-card">
                    <div className="solutions-card-thumb">
                      <img src={entry.image || fallbackImages[i * 2 % fallbackImages.length]} alt="" width="900" height="620" loading={i === 0 ? 'eager' : 'lazy'} />
                      <img src={entry.image || fallbackImages[i * 2 % fallbackImages.length]} alt="" width="900" height="620" loading={i === 0 ? 'eager' : 'lazy'} aria-hidden="true" />
                      {entry.link && (
                        <Link to={entry.link.href} className="solutions-card-arrow" aria-label={`Read ${entry.title}`}>
                          <ArrowIcon />
                        </Link>
                      )}
                      <div className="solutions-card-content">
                        <div className="solutions-card-info">
                          <h2 className="solutions-card-title">
                            {entry.link ? <Link to={entry.link.href}>{entry.title}</Link> : entry.title}
                          </h2>
                          {entry.label && (
                            <div className="solutions-card-tags"><span>{entry.label}</span></div>
                          )}
                        </div>
                        <span className="solutions-card-year">[ {entry.year ?? year} ]</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="solutions-col solutions-col-offset">
                {right.map((entry, i) => (
                  <Reveal key={entry.link!.href} direction="right" delay={150} className="solutions-card">
                    <div className="solutions-card-thumb">
                      <img src={entry.image || fallbackImages[(i * 2 + 1) % fallbackImages.length]} alt="" width="900" height="620" loading="lazy" />
                      <img src={entry.image || fallbackImages[(i * 2 + 1) % fallbackImages.length]} alt="" width="900" height="620" loading="lazy" aria-hidden="true" />
                      {entry.link && (
                        <Link to={entry.link.href} className="solutions-card-arrow" aria-label={`Read ${entry.title}`}>
                          <ArrowIcon />
                        </Link>
                      )}
                      <div className="solutions-card-content">
                        <div className="solutions-card-info">
                          <h2 className="solutions-card-title">
                            {entry.link ? <Link to={entry.link.href}>{entry.title}</Link> : entry.title}
                          </h2>
                          {entry.label && (
                            <div className="solutions-card-tags"><span>{entry.label}</span></div>
                          )}
                        </div>
                        <span className="solutions-card-year">[ {entry.year ?? year} ]</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {!entries.length && (
        <section className="section">
          <div className="container">
            <p>No case studies have been published yet.</p>
          </div>
        </section>
      )}

      <ConnectedSystems />
    </div>
  );
}

function Copy({ config }: { config: BlockConfig }) {
  return (
    <>
      {config.body?.map((text, i) => <p key={i}>{text}</p>)}
      {config.items?.filter(item => item.title || item.body).length
        ? <ul className="work-detail-list">{config.items.filter(item => item.title || item.body).map((item, i) => <li key={i}>{item.link ? <Link to={item.link.href}>{item.title}</Link> : item.title}{item.body && <p>{item.body}</p>}</li>)}</ul>
        : null}
      {config.cta && <Link className="text-link" to={config.cta.href}>{config.cta.label} <ArrowIcon /></Link>}
    </>
  );
}

export function WorkDetail({ page, entries }: { page: Page; entries: WorkEntry[] }) {
  const hero = page.blocks.find(block => block.block_type === 'hero')?.config || { title: page.title };
  const entry = entries.find(item => item.slug === page.slug);
  const { previous, next } = workNeighbours(entries, page.slug);
  const sections = page.blocks.filter(block => block.block_type !== 'hero');

  // Meta facts from hero config
  const metaItems = [
    { label: 'Client', value: hero.client },
    { label: 'Services', value: hero.services },
    { label: 'Platform', value: hero.platform },
    { label: 'Year', value: hero.projectDate ?? entry?.year },
  ].filter(m => m.value);

  // Feature image — entry image, hero image, or fallback
  const featureImg = entry?.image || hero.image || fallbackImages[0];

  // Pair of images for the dual-image section
  const pairImg1 = hero.galleryLeft || fallbackImages[1];
  const pairImg2 = hero.galleryRight || fallbackImages[2];

  // Intro section = first editorial block
  const introSection = sections[0];
  // Remaining sections
  const bodySections = sections.slice(1);

  return (
    <article className="work-reference work-detail work-detail-page">
      {/* ── 01 Hero ── */}
      <PageHero
        eyebrow={hero.eyebrow ?? 'Case study / Selected work'}
        title={hero.title ?? page.title}
        accent={hero.accent}
        pageLabel="Case Study"
        metaLines={hero.body?.slice(0, 1) ?? []}
        bgImage="/assets/images/about hero/Einao Profiles in emerald light.png"
        secondaryLink={{ label: 'All case studies', href: '/work/' }}
      />

      {/* ── 02 Full-width feature image ── */}
      <section className="sdp-feature-image">
        <div className="container">
          <Reveal>
            <div className="sdp-feature-thumb">
              <img src={featureImg} alt="" width="1400" height="700" loading="eager" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 03 Info strip: title + meta grid ── */}
      <section className="section sdp-info-strip">
        <div className="container sdp-info-container">
          <Reveal direction="left" className="sdp-info-text">
            <h2>{introSection?.config.title ?? hero.title ?? page.title}</h2>
            <p>{introSection?.config.body?.[0] ?? hero.body?.[0] ?? ''}</p>
          </Reveal>
          <Reveal direction="right" delay={100} className="sdp-meta-grid">
            {metaItems.length > 0
              ? metaItems.map(m => (
                <div key={m.label} className="sdp-meta-item">
                  <span>{m.label}</span>
                  <p>{m.value}</p>
                </div>
              ))
              : <>
                <div className="sdp-meta-item"><span>Client</span><p>Federal Ministry of Industry, Trade &amp; Investment</p></div>
                <div className="sdp-meta-item"><span>Services</span><p>Enterprise portal development &amp; support</p></div>
                <div className="sdp-meta-item"><span>Platform</span><p>Institutional digital service</p></div>
                <div className="sdp-meta-item sdp-meta-item-last"><span>Since</span><p>2013</p></div>
              </>
            }
          </Reveal>
        </div>
      </section>

      {/* ── 04 Detail image ── */}
      <section className="sdp-detail-image">
        <div className="container">
          <Reveal>
            <div className="sdp-detail-thumb">
              <img src={pairImg1} alt="" width="1400" height="800" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 05 Body sections: heading left + copy right ── */}
      {bodySections.map((block, i) => (
        <section key={block.id} className="section sdp-body-section">
          <div className="container">
            <div className="sdp-body-grid">
              <Reveal direction="left" className="sdp-body-left">
                <h2>{block.config.title}</h2>
              </Reveal>
              <Reveal direction="right" delay={100} className="sdp-body-right">
                {block.config.body?.map((text: string, j: number) => <p key={j}>{text}</p>)}
                {block.config.items && block.config.items.length > 0 && (
                  <ul className="sdp-checklist">
                    {block.config.items.filter((item: { title?: string }) => item.title).map((item: { title?: string }) => (
                      <li key={item.title}>
                        <span className="sdp-check" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5 6.5 12.5 13.5 4" /></svg>
                        </span>
                        {item.title}
                      </li>
                    ))}
                  </ul>
                )}
                {block.config.cta && (
                  <Link className="action-link" to={block.config.cta.href}>
                    {block.config.cta.label} <ArrowIcon />
                  </Link>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* ── 06 Dual images ── */}
      <section className="sdp-dual-images">
        <div className="container">
          <div className="sdp-dual-grid">
            <Reveal direction="left">
              <div className="sdp-dual-thumb">
                <img src={pairImg1} alt="" width="700" height="520" loading="lazy" />
              </div>
            </Reveal>
            <Reveal direction="right" delay={120}>
              <div className="sdp-dual-thumb">
                <img src={pairImg2} alt="" width="700" height="520" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 07 Prev / Next nav ── */}
      <nav className="sdp-nav" aria-label="Case study navigation">
        <div className="container sdp-nav-inner">
          {previous ? (
            <Link to={previous.link!.href} className="sdp-nav-item sdp-nav-prev">
              <span className="sdp-nav-arrow" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 5-7 7 7 7" /></svg>
              </span>
              <span className="sdp-nav-meta"><span className="sdp-nav-label">Previous</span><span className="sdp-nav-name">{previous.title}</span></span>
            </Link>
          ) : <span />}
          <Link to="/work/" className="sdp-nav-grid" aria-label="All case studies">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          </Link>
          {next ? (
            <Link to={next.link!.href} className="sdp-nav-item sdp-nav-next">
              <span className="sdp-nav-meta"><span className="sdp-nav-label">Next</span><span className="sdp-nav-name">{next.title}</span></span>
              <span className="sdp-nav-arrow" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 5 7 7-7 7" /></svg>
              </span>
            </Link>
          ) : <span />}
        </div>
      </nav>
    </article>
  );
}
