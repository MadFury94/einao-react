import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MONTHS = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};

function sqlEscape(value) {
    return String(value ?? "").replace(/'/g, "''");
}

function slugify(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function parseDateLabel(value) {
    const trimmed = String(value ?? "").trim();
    const match = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!match) return "";

    const month = MONTHS[match[1].toLowerCase()];
    if (!month) return "";

    const year = Number(match[2]);
    const mm = String(month).padStart(2, "0");
    return `${year}-${mm}-01 12:00:00`;
}

function parseReadMinutes(value) {
    const match = String(value ?? "").match(/(\d+)/);
    return match ? Number(match[1]) : 3;
}

function toHtmlParagraphs(content) {
    const normalized = String(content ?? "").replace(/\r\n/g, "\n").trim();
    if (!normalized) return "";

    const escaped = normalized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    return escaped
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
        .join("\n");
}

function buildSql(blogPosts) {
    const uniqueCategories = Array.from(new Set(blogPosts.map((post) => post.category).filter(Boolean)));
    const uniqueTags = Array.from(
        new Set(blogPosts.flatMap((post) => (Array.isArray(post.tags) ? post.tags : [])).filter(Boolean)),
    );

    const lines = [
        "BEGIN TRANSACTION;",
        "",
        "-- Ensure blog categories exist",
    ];

    uniqueCategories.forEach((categoryName) => {
        const slug = slugify(categoryName);
        lines.push(
            `INSERT OR IGNORE INTO categories (name, slug, type, sort_order)
VALUES ('${sqlEscape(categoryName)}', '${sqlEscape(slug)}', 'blog', (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories));`,
        );
    });

    lines.push("", "-- Ensure tags exist");

    uniqueTags.forEach((tagName) => {
        const slug = slugify(tagName);
        lines.push(
            `INSERT INTO tags (name, slug)
VALUES ('${sqlEscape(tagName)}', '${sqlEscape(slug)}')
ON CONFLICT(name) DO UPDATE SET slug = excluded.slug
WHERE tags.slug IS NULL OR tags.slug = '';`,
        );
    });

    lines.push("", "-- Upsert blog posts and sync tag/category relationships");

    blogPosts.forEach((post) => {
        const slug = slugify(post.id || post.slug || post.title);
        const categorySlug = slugify(post.category || "news");
        const title = post.title ?? "Untitled";
        const excerpt = post.excerpt ?? "";
        const contentHtml = toHtmlParagraphs(post.content);
        const featuredImage = post.image ?? "";
        const publishedAt = parseDateLabel(post.date);
        const readingMinutes = parseReadMinutes(post.readTime);

        lines.push(
            `INSERT INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at, post_type)
VALUES (
  '${sqlEscape(title)}',
  '${sqlEscape(slug)}',
  '${sqlEscape(excerpt)}',
  '${sqlEscape(contentHtml)}',
  '{"type":"doc","content":[]}',
  '${sqlEscape(featuredImage)}',
  COALESCE((SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1), (SELECT id FROM users LIMIT 1)),
  'published',
  ${readingMinutes},
  ${publishedAt ? `'${sqlEscape(publishedAt)}'` : "NULL"},
  'blog'
)
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_html = excluded.content_html,
  featured_image_url = excluded.featured_image_url,
  status = excluded.status,
  reading_minutes = excluded.reading_minutes,
  published_at = excluded.published_at,
  post_type = excluded.post_type,
  updated_at = datetime('now');`,
        );

        lines.push(
            `DELETE FROM post_categories WHERE post_id = (SELECT id FROM posts WHERE slug = '${sqlEscape(slug)}');`,
            `INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = '${sqlEscape(slug)}'),
  (SELECT id FROM categories WHERE slug = '${sqlEscape(categorySlug)}' AND type = 'blog')
);`,
            `DELETE FROM post_tags WHERE post_id = (SELECT id FROM posts WHERE slug = '${sqlEscape(slug)}');`,
        );

        const postTags = Array.isArray(post.tags) ? post.tags : [];
        postTags.forEach((tagName) => {
            const tagSlug = slugify(tagName);
            lines.push(
                `INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = '${sqlEscape(slug)}'),
  (SELECT id FROM tags WHERE slug = '${sqlEscape(tagSlug)}')
);`,
            );
        });

        lines.push("");
    });

    lines.push("COMMIT;", "");
    return lines.join("\n");
}

function main() {
    const argv = new Set(process.argv.slice(2));
    const target = argv.has("--remote") ? "--remote" : "--local";

    const thisFile = fileURLToPath(import.meta.url);
    const scriptsDir = path.dirname(thisFile);
    const backendDir = path.resolve(scriptsDir, "..");
    const repoRoot = path.resolve(backendDir, "..");
    const contentPath = path.resolve(repoRoot, "apps/client/app/data/content.json");

    const rawContent = fs.readFileSync(contentPath, "utf8").replace(/^\uFEFF/, "");
    const json = JSON.parse(rawContent);
    const blogPosts = Array.isArray(json.blogPosts) ? json.blogPosts : [];

    if (!blogPosts.length) {
        console.error("No blogPosts found in apps/client/app/data/content.json");
        process.exit(1);
    }

    const sql = buildSql(blogPosts);
    const sqlFile = path.join(os.tmpdir(), `seed-blog-content-${Date.now()}.sql`);

    fs.writeFileSync(sqlFile, sql, "utf8");

    try {
        execFileSync(
            "npx",
            ["wrangler", "d1", "execute", "einao_db", target, "--file", sqlFile],
            { cwd: backendDir, stdio: "inherit" },
        );
        console.log(`Seeded ${blogPosts.length} blog posts from client content (${target.replace("--", "")}).`);
    } finally {
        fs.unlinkSync(sqlFile);
    }
}

main();
