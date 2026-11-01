-- Seed default 'coming-soon' page layout using page_blocks.
-- Block types: cs_logo, cs_headline, cs_meta, cs_cta, cs_footer

INSERT INTO page_blocks (page_slug, block_type, position, config, visible) VALUES
  ('coming-soon', 'cs_logo',     0, '{"src":"/scyte-logo.png","alt":"Scyte Studios","width":313,"height":313}', 1),
  ('coming-soon', 'cs_headline', 1, '{"heading":"COMING SOON","lines":[{"text":"Building compact, cozy games with personality","size":"lg"},{"text":"from rhythm platformers to narrative-driven FPS.","size":"md"}]}', 1),
  ('coming-soon', 'cs_meta',     2, '{"items":[{"text":"Indie Game Studio"},{"text":"Teesside, UK"},{"text":"Est. June 2025"}]}', 1),
  ('coming-soon', 'cs_cta',      3, '{"buttons":[{"label":"Wishlist Meowsic on Steam","href":"https://store.steampowered.com/app/4468420/Meowsic/","variant":"primary","target":"_blank"},{"label":"Get in Touch","href":"mailto:contact@scytestudios.com","variant":"secondary"}]}', 1),
  ('coming-soon', 'cs_footer',   4, '{"text":"Website launching soon"}', 1);
