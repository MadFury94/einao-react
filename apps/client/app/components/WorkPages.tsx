import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import type { BlockConfig, Page } from '@einao/content';
import { workNeighbours, type WorkEntry } from '../lib/work';
import { ArrowIcon } from './ArrowIcon';
import { ConnectedSystems } from './ConnectedSystems';
import './work-pages.css';

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
function WorkHeading({ title, detail = false }: { title: string; detail?: boolean }) {
  const words = title.split(' ');
  const split = Math.ceil(words.length / 2);
  return <header className="work-breadcrumb"><div className="work-container"><h1><em>{words.slice(0, split).join(' ')}</em>{' '}{words.slice(split).join(' ')}</h1><div className="work-breadcrumb-bottom"><div><span>Einao Solutions</span><span>{detail ? 'Selected case study' : 'Consult. Automate. Build.'}</span></div><h2>{detail ? 'Overview' : 'Our work'}</h2></div></div></header>;
}
export function WorkListing({ page, entries }: { page: Page; entries: WorkEntry[] }) {
  const title = page.blocks.find(block => block.block_type === 'hero')?.config.title || page.title;
  return <div className="work-reference"><WorkHeading title={title} /><section className="work-listing work-container-wide" aria-label="Case studies"><div className="work-grid">{entries.map((entry, index) => <article className="work-card" key={entry.link!.href}>
    <Link className="work-card-image" to={entry.link!.href} aria-label={`Read ${entry.title} case study`}><img src={entry.image || fallbackImage} alt="" width="750" height="750" loading={index < 2 ? 'eager' : 'lazy'} /><img src={entry.image || fallbackImage} alt="" width="750" height="750" loading={index < 2 ? 'eager' : 'lazy'} /><span className="work-card-arrow" aria-hidden="true"><ArrowIcon /></span></Link>
    <div className="work-card-content"><div><h2><Link to={entry.link!.href}>{entry.title}</Link></h2><div className="work-tags">{entry.label && <span>{entry.label}</span>}</div></div>{entry.year && <span className="work-year">[ {entry.year} ]</span>}</div>
  </article>)}</div>{!entries.length && <p>No case studies have been published yet.</p>}</section><ConnectedSystems /></div>;
}
function Copy({ config }: { config: BlockConfig }) { return <>{config.body?.map((text, i) => <p key={i}>{text}</p>)}{config.items?.filter(item => item.title || item.body).length ? <ul className="work-detail-list">{config.items.filter(item => item.title || item.body).map((item, i) => <li key={i}>{item.link ? <Link to={item.link.href}>{item.title}</Link> : item.title}{item.body && <p>{item.body}</p>}</li>)}</ul> : null}{config.cta && <Link className="text-link" to={config.cta.href}>{config.cta.label} <ArrowIcon /></Link>}</>; }
export function WorkDetail({ page, entries }: { page: Page; entries: WorkEntry[] }) {
  const hero = page.blocks.find(block => block.block_type === 'hero')?.config || { title: page.title };
  const entry = entries.find(item => item.slug === page.slug);
  const { previous, next } = workNeighbours(entries, page.slug);
  const facts = [['Client', hero.client], ['Services', hero.services], ['Platform', hero.platform], ['Date', hero.projectDate]].filter(([, value]) => value);
  const sections = page.blocks.filter(block => block.block_type !== 'hero');
  return <article className="work-reference work-detail"><WorkHeading title={hero.title} detail />
    <div className="work-container work-detail-cover"><ProjectImage src={hero.image || entry?.image || fallbackImage} alt={hero.imageAlt || ''} priority /></div>
    <div className="work-container-wide work-detail-body"><div className="work-detail-intro"><h2>{entry?.title || page.title}</h2><div>{hero.body?.map((text, i) => <p key={i}>{text}</p>)}</div></div>
      {facts.length > 0 && <dl className="work-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}:</dt><dd>{value}</dd></div>)}</dl>}
      {hero.overviewImage && <ProjectImage className="work-overview-image" src={hero.overviewImage} alt={hero.overviewImageAlt} />}
      {sections.map((block, index) => {
        const config = block.config;
        const steps = config.items?.filter(item => item.title || item.body) || [];
        const isProcess = /approach|process|research/i.test(config.title) && steps.length > 0;
        return <section key={block.id} className="work-detail-section">
          {isProcess ? <><h2>{config.title}</h2><div className="work-steps">{steps.map((step, i) => <div className="work-step" key={i}><span>{String(i + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.body}</p></div>)}</div>{config.body?.map((text,i) => <p key={i}>{text}</p>)}</> : <div className="work-detail-split"><h2>{config.title}</h2><div className="work-detail-copy"><Copy config={config} /></div></div>}
          {config.image && <ProjectImage className="work-section-image" src={config.image} alt={config.imageAlt} />}
          {index === 0 && (hero.galleryLeft || hero.galleryRight) && <div className="work-gallery">{hero.galleryLeft && <ProjectImage src={hero.galleryLeft} alt={hero.galleryLeftAlt} />}{hero.galleryRight && <ProjectImage src={hero.galleryRight} alt={hero.galleryRightAlt} />}</div>}
        </section>;
      })}
      {!sections.length && (hero.galleryLeft || hero.galleryRight) && <div className="work-gallery">{hero.galleryLeft && <ProjectImage src={hero.galleryLeft} alt={hero.galleryLeftAlt} />}{hero.galleryRight && <ProjectImage src={hero.galleryRight} alt={hero.galleryRightAlt} />}</div>}
      <nav className="work-pagination" aria-label="Case study navigation">
        {previous ? <Link to={previous.link!.href} aria-label={`Previous case study: ${previous.title}`}><span className="work-nav-arrow" aria-hidden="true">&lsaquo;</span><span>Previous</span></Link> : <span className="work-nav-disabled"><span className="work-nav-arrow" aria-hidden="true">&lsaquo;</span><span>Previous</span></span>}
        <Link className="work-grid-link" to="/work/" aria-label="All case studies"><svg viewBox="0 0 24 24" aria-hidden="true">{[0,1,2].flatMap(y => [0,1,2].map(x => <rect key={`${x}-${y}`} x={x*8} y={y*8} width="5" height="5" />))}</svg></Link>
        {next ? <Link to={next.link!.href} aria-label={`Next case study: ${next.title}`}><span>Next</span><span className="work-nav-arrow" aria-hidden="true">&rsaquo;</span></Link> : <span className="work-nav-disabled"><span>Next</span><span className="work-nav-arrow" aria-hidden="true">&rsaquo;</span></span>}
      </nav>
    </div>
  </article>;
}
