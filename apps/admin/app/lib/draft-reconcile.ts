/**
 * Pure reconciliation logic for the post-editor autosave loop.
 *
 * IMPORTANT: The autosave PUT endpoint is for content fields only
 * (title, content, excerpt, SEO, tags, categories). It is NOT the
 * source of truth for `scheduled_for` ... that field is owned by the
 * dedicated `/schedule` and `/unpublish` endpoints.
 *
 * However, the server still ECHOES whatever `scheduled_for` value is
 * currently in the row (because UPDATE writes the existing value back).
 * If we naively adopted that value, a post that was previously scheduled
 * for some date X would force the editor's local `scheduleFor` back to X
 * every time the user typed ... wiping any new date they picked.
 *
 * Therefore the reconciler ALWAYS preserves `scheduleFor` from the live
 * client state. The user's local pick is only committed (and the editor's
 * value only overwritten) when the dedicated /schedule endpoint is called,
 * which is handled separately in the route component.
 *
 * Inputs:
 *  - `baseline` ... draft at the moment autosave STARTED (what we sent).
 *                 Used to derive the new "clean" snapshot for the dirty check.
 *  - `latest`   ... LIVE draft when the server responded. May contain edits
 *                 (typing, a freshly-picked date) made during the in-flight
 *                 fetch ... these must NOT be lost.
 *  - `updated`  ... server response. We adopt server-authoritative fields
 *                 (currently just `slug`, which the server may rewrite for
 *                 uniqueness). `scheduled_for` is intentionally ignored.
 */

export type ReconcileableDraft = {
  slug: string
  scheduleFor: Date | undefined
  // index signature so callers can pass their full EditorDraft shape
  [key: string]: unknown
}

export type ReconcileableServerPost = {
  slug: string
  /** Echoed by the server but ignored ... see module doc. */
  scheduled_for: string | null
}

export type ReconcileResult<T extends ReconcileableDraft> = {
  /** What we believe the server now has ... used to refresh the "clean" snapshot. */
  savedSnapshot: T
  /** What to feed into setDraft ... preserves mid-save user edits. */
  nextDraft: T
}

export function reconcileSavedDraft<T extends ReconcileableDraft>(
  baseline: T,
  latest: T,
  updated: ReconcileableServerPost
): ReconcileResult<T> {
  // savedSnapshot: what we sent + server-rewritten slug. The user's pending
  // local `scheduleFor` is NOT part of what the server stored via this PUT,
  // but we still need the saved snapshot to match the local draft for the
  // dirty-check to settle ... so we keep baseline.scheduleFor here too.
  const savedSnapshot: T = {
    ...baseline,
    slug: updated.slug,
    scheduleFor: baseline.scheduleFor,
  }

  // nextDraft: start from the LATEST live draft (preserves mid-save edits),
  // adopt server slug, and ALWAYS keep the live local scheduleFor.
  const nextDraft: T = {
    ...latest,
    slug: updated.slug,
    scheduleFor: latest.scheduleFor,
  }

  return { savedSnapshot, nextDraft }
}
