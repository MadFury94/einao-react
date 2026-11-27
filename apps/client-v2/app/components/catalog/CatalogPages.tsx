import { SectionShortcut } from '../admin/SectionShortcut';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import type { BlockConfig, Page, PageBlock } from '@einao/content';
import { safeHref, type Collection, type CollectionKey } from '~/lib/catalog';
import { ReferenceHero } from '../reference-hero/ReferenceHero';
import { ReferenceFaq } from '../capabilities/Capabilities';
import cards from '../capabilities/Capabilities.module.css';
import styles from './CatalogPages.module.css';
export const collectionLabels = { solutions: 'Solutions', capabilities: 'Capabilities', work: 'Work' };
function Paragraphs({ body }: { body?: string[] }) { return <>{body?.filter(Boolean).map((text, i) => <p key={i}>{text}</p>)}</>; }
function Buttons({ config }: { config: BlockConfig }) { return <div className={styles.actions}>{[config.cta, config.secondaryCta].map((link, i) => safeHref(link?.href) && <Link key={i} className={styles.link} to={link!.href}>{link!.label} →</Link>)}</div>; }
function PageHero({ page, label }: { page: Page; label: string }) {
  const heroBlock = page.blocks.find(block => block.block_type === 'hero');
  const hero = heroBlock?.config;
  const menu = page.slug.split('/')[0];
  const hasMenu = ['capabilities', 'solutions', 'work'].includes(menu);
  const isDetail = page.slug.includes('/');
  const adminPath = hasMenu ? '/' + menu + (isDetail ? '?page=' + encodeURIComponent(page.slug) : '') : heroBlock ? '/page-blocks/' + heroBlock.id + '?page=' + encodeURIComponent(page.slug) : undefined;
  return <><SectionShortcut name="Hero" hero path={adminPath} action={hasMenu ? isDetail ? 'Edit item page' : 'Manage items' : 'Section settings'}><ReferenceHero label={hero?.eyebrow || label} title={hero?.title || page.title} intro={hero?.body?.join('\n\n') ?? page.description} image={hero?.image || undefined} imageAlt={hero?.imageAlt} cta={safeHref(hero?.cta?.href) ? hero?.cta?.label : undefined} ctaHref={safeHref(hero?.cta?.href)} /></SectionShortcut>
    {hero?.secondaryCta && safeHref(hero.secondaryCta.href) && <div className={styles.container}><Link className={styles.link} to={hero.secondaryCta.href}>{hero.secondaryCta.label} →</Link></div>}
    {hero?.video && safeHref(hero.video) && <div className={styles.container}><video className={styles.media} src={hero.video} controls preload="metadata" poster={hero.image} /></div>}
  </>;
}
export function ContentSections({ blocks }: { blocks: PageBlock[] }) {
  return <>{blocks.map(block => {
    const config = block.config;
    const items = config.items ?? [];
    return <section className={styles.section} key={block.id}><div className={styles.container}>
      <div className={config.image ? styles.feature : undefined}><div>{config.eyebrow && <span className={styles.eyebrow}>{config.eyebrow}</span>}{config.title && <h2>{config.title}</h2>}<Paragraphs body={config.body} /></div>{config.image && <img className={styles.media} src={config.image} alt={config.imageAlt || ''} loading="lazy" />}</div>
      {items.length > 0 && <div className={styles.grid}>{items.map((item, index) => <article className={styles.item} key={index}>
        {item.image && <img className={styles.media} src={item.image} alt="" loading="lazy" />}{item.label && <span className={styles.eyebrow}>{item.label}</span>}{item.badge && <span className={styles.badge}>{item.badge}</span>}
        <h3>{item.title}</h3><div className={styles.itemBody}><Paragraphs body={item.body?.split(/\n\s*\n/)} /></div>{safeHref(item.link?.href) && <Link className={styles.link} to={item.link!.href}>{item.link!.label || 'Read more'} →</Link>}
      </article>)}</div>}
      <Buttons config={config} />
    </div></section>;
  })}</>;
}
export function CollectionPage({ collection }: { collection: Collection }) {
  const { key, page, block, entries } = collection;
  return <main className={cards.page}><PageHero page={page} label={collectionLabels[key]} />
    {block && <section className={cards.intro}><div className={cards.sectionInner}>{block.config.eyebrow && <span>{block.config.eyebrow}</span>}<h2>{block.config.title}</h2><Paragraphs body={block.config.body} /></div></section>}
    <section className={cards.cardSection}><div className={cards.cards}>{entries.map((item, index) => <article className={cards.card} key={item.slug || index}>
      {item.image && <div className={cards.cardVisual}><img src={item.image} alt="" loading="lazy" /></div>}
      <div className={cards.cardBody}>{item.label && <span className={styles.eyebrow}>{item.label}</span>}{item.badge && <span className={styles.badge}>{item.badge}</span>}<h3>{item.link ? <Link className={cards.cardTitleLink} to={item.link.href}>{item.title}</Link> : item.title}</h3><p>{item.body}</p>{item.year && <p>{item.year}</p>}{item.link && <Link className={cards.cardCta} to={item.link.href}>{item.link.label || 'Read more'} →</Link>}</div>
    </article>)}</div>{!entries.length && <p className={styles.empty}>No {key === 'work' ? 'case studies' : key} have been published yet.</p>}</section>
    <ContentSections blocks={page.blocks.filter(section => section.block_type !== 'hero' && section.id !== block?.id)} />
    <ReferenceFaq />
  </main>;
}
export function DetailPage({ page, collectionKey }: { page: Page; collectionKey: CollectionKey }) {
  const hero = page.blocks.find(block => block.block_type === 'hero')?.config;
  const facts = [['Client', hero?.client], ['Services', hero?.services], ['Platform', hero?.platform], ['Date', hero?.projectDate]].filter(([, value]) => value);
  return <main className={cards.page}><PageHero page={page} label={collectionLabels[collectionKey]} />
    {collectionKey === 'work' && hero && <div className={styles.container}>
      {facts.length > 0 && <dl className={styles.facts}>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      {hero.overviewImage && <img className={styles.media} src={hero.overviewImage} alt={hero.overviewImageAlt || ''} loading="lazy" />}
    </div>}
    <ContentSections blocks={page.blocks.filter(block => block.block_type !== 'hero')} />
    {collectionKey === 'work' && hero && (hero.galleryLeft || hero.galleryRight) && <div className={`${styles.container} ${styles.grid}`}>{hero.galleryLeft && <img className={styles.media} src={hero.galleryLeft} alt={hero.galleryLeftAlt || ''} loading="lazy" />}{hero.galleryRight && <img className={styles.media} src={hero.galleryRight} alt={hero.galleryRightAlt || ''} loading="lazy" />}</div>}
    <div className={`${styles.container} ${styles.back}`}><Link className={styles.link} to={`/${collectionKey}/`}>Back to all {collectionKey === 'work' ? 'work' : collectionKey}</Link></div>
    <ReferenceFaq />
  </main>;
}
export function CatalogError() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return <main className={`${styles.container} ${styles.error}`}><h1>{missing ? 'Page not found' : 'Content is temporarily unavailable'}</h1><p>{missing ? 'This page may no longer be published.' : 'Please try again shortly.'}</p><Link to="/">Back to home</Link></main>;
}
