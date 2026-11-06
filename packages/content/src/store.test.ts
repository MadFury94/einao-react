import { test } from "node:test";
import assert from "node:assert/strict";
import { createContentStore } from "./store.ts";
import { pages, site } from "./seed.ts";

test("public reads omit drafts and hidden blocks and preserve section order", async () => {
	const source = structuredClone(pages);
	// This test owns its draft fixture; the live privacy notice is published.
	source.find((page) => page.slug === "privacy-notice")!.status = "draft";
	source[0].blocks[1].visible = false;
	source[0].blocks.reverse();
	const store = createContentStore(source);
	assert.equal(await store.getPage("privacy-notice"), null);
	const home = (await store.getPage("/"))!;
	assert.equal(home.blocks[0].block_type, "hero");
	assert.ok(home.blocks.every((b) => b.visible));
	assert.ok(
		home.blocks.every(
			(b, i, all) => i === 0 || b.position > all[i - 1].position,
		),
	);
	assert.ok(!(await store.listPages()).some((p) => p.status === "draft"));
});
test("SSR reads and separate store instances do not share mutable content", async () => {
	const store = createContentStore();
	const first = (await store.getPage("home"))!;
	first.blocks[0].config.title = "Changed by another request";
	assert.notEqual(
		(await store.getPage("home"))!.blocks[0].config.title,
		first.blocks[0].config.title,
	);
	assert.notEqual(
		(await createContentStore().getPage("home"))!.blocks[0].config.title,
		first.blocks[0].config.title,
	);
});
test("navigation and content links resolve to public pages or section anchors", async () => {
	const store = createContentStore();
	const links = site.navigation
		.flatMap((n) => [n, ...(n.children ?? [])])
		.map((n) => n.href);
	for (const p of pages.filter((p) => p.status === "published"))
		for (const b of p.blocks) {
			for (const link of [
				b.config.cta,
				b.config.secondaryCta,
				...(b.config.items ?? []).map((i) => i.link),
			])
				if (link) links.push(link.href);
		}
	for (const href of links) {
		const path = new URL(href, "https://einao.test").pathname;
		assert.ok(await store.getPage(path), `Missing destination: ${href}`);
	}
});
test("unknown pages do not silently render home", async () => {
	assert.equal(await createContentStore().getPage("not-a-real-page"), null);
});
