-- Seed the six editorial Insights briefs from the Einao website brief.
-- They intentionally start as drafts so an editor can review and publish them.
INSERT OR IGNORE INTO categories (name, slug, type, sort_order)
VALUES ('Operations', 'operations', 'blog', 20);

INSERT OR IGNORE INTO posts
  (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, post_type, subtitle, seo_title, seo_description)
VALUES
  ('Before You Buy Software: Five Questions Every Organisation Should Answer', 'before-you-buy-software-five-questions',
   'A practical set of questions to answer before choosing software for an important organisational process.',
   '<p>Buying software is easy to frame as a product decision. The better starting point is the operational requirement the software must support.</p><h2>Five questions to answer first</h2><ol><li>What problem are we solving?</li><li>Who needs to use the system, and what do they need to do?</li><li>Where does information enter, change, and leave the process?</li><li>What must connect to existing systems?</li><li>How will the organisation support and improve the system after launch?</li></ol><p>Clear answers make it easier to compare options, define requirements, and avoid paying for functionality that does not solve the real problem.</p>',
   '{"type":"doc","content":[]}', '', (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), 'draft', 4, 'blog', 'A better software decision begins with a better understanding of the requirement.', '', ''),
  ('Digitising a Broken Process Does Not Fix It', 'digitising-a-broken-process-does-not-fix-it',
   'Why moving a confusing manual process into software can preserve the same problems at greater speed.',
   '<p>Digital tools can make work faster, but speed does not make an unclear process better. If responsibilities, approvals, information, or handoffs are poorly defined, digitisation can simply reproduce the confusion.</p><h2>Start with the work</h2><p>Map how the process actually operates, where delays occur, what people repeat, and which decisions need clearer rules. Then design the digital workflow around that understanding.</p><p>The strongest automation projects improve the process before they automate it.</p>',
   '{"type":"doc","content":[]}', '', (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), 'draft', 3, 'blog', 'Improvement should come before automation.', '', ''),
  ('Where Manual Work Creates Hidden Operational Costs', 'where-manual-work-creates-hidden-operational-costs',
   'The cost of manual work is often found in delays, duplication, rework, and decisions made without reliable visibility.',
   '<p>Manual work does not only consume the hours visible on a timesheet. It also creates repeated data entry, status chasing, avoidable errors, slow approvals, and reporting that depends on manual compilation.</p><h2>Look for the signals</h2><p>Long email chains, spreadsheets passed between teams, unclear ownership, and repeated requests for the same information are signals that a process may need attention.</p><p>Making those costs visible helps organisations decide where process improvement or automation will create the greatest practical value.</p>',
   '{"type":"doc","content":[]}', '', (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), 'draft', 3, 'blog', 'Small inefficiencies become expensive when they repeat across an organisation.', '', ''),
  ('When Should an Organisation Integrate Existing Systems Instead of Replacing Them?', 'integrate-existing-systems-instead-of-replacing-them',
   'A guide to deciding when integration is the more responsible response to disconnected systems.',
   '<p>Replacing a system is not always the best way to solve a disconnected workflow. Existing applications may contain valuable data, established controls, or capabilities that the organisation still needs.</p><h2>Consider the whole landscape</h2><p>Assess the cost of replacement, the quality of the existing interfaces, the data that must move, and the operational disruption a change would create.</p><p>Integration can connect systems around a clearer process while protecting investments that still serve a useful purpose.</p>',
   '{"type":"doc","content":[]}', '', (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), 'draft', 4, 'blog', 'The right answer may be a connected system landscape, not a wholesale replacement.', '', ''),
  ('What Organisations Should Plan for After a Digital Platform Goes Live', 'what-to-plan-for-after-a-digital-platform-goes-live',
   'Launch is the beginning of operational use. Here are the support and improvement questions to plan for next.',
   '<p>A digital platform becomes useful through sustained operation. Teams learn from real usage, requirements change, and technical maintenance becomes part of keeping the service dependable.</p><h2>Plan for the life of the system</h2><p>Agree how issues will be reported, how improvements will be prioritised, how performance will be monitored, and who owns the decisions that follow launch.</p><p>Ongoing attention helps a platform remain aligned with the organisation it serves.</p>',
   '{"type":"doc","content":[]}', '', (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), 'draft', 3, 'blog', 'A platform is part of the organisation’s operations after launch, not a finished project.', '', ''),
  ('How to Write Better Requirements for an Enterprise Portal', 'how-to-write-better-requirements-for-an-enterprise-portal',
   'A practical way to describe users, workflows, information, rules, and outcomes before building an enterprise portal.',
   '<p>Good requirements help an enterprise portal reflect the work people need to do. They describe more than a list of features: they explain users, information, decisions, permissions, integrations, and the outcome the service must support.</p><h2>Describe the work clearly</h2><p>Document the audiences, the stages in the process, the information required at each stage, the rules that govern decisions, and the measures that will show whether the portal is working.</p><p>That shared understanding gives design and delivery teams a stronger basis for making technical decisions.</p>',
   '{"type":"doc","content":[]}', '', (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), 'draft', 4, 'blog', 'Better requirements connect organisational intent to practical system behaviour.', '', '');

INSERT OR IGNORE INTO post_categories (post_id, category_id)
SELECT p.id, c.id FROM posts p, categories c
WHERE p.post_type = 'blog' AND p.slug IN (
  'before-you-buy-software-five-questions',
  'digitising-a-broken-process-does-not-fix-it',
  'where-manual-work-creates-hidden-operational-costs',
  'integrate-existing-systems-instead-of-replacing-them',
  'what-to-plan-for-after-a-digital-platform-goes-live',
  'how-to-write-better-requirements-for-an-enterprise-portal'
) AND c.slug = 'operations' AND c.type = 'blog';
