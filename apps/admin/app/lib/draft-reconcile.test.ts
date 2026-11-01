import { describe, expect, it } from 'vitest'
import { reconcileSavedDraft } from './draft-reconcile'

type TestDraft = {
  title: string
  slug: string
  scheduleFor: Date | undefined
}

function makeDraft(over: Partial<TestDraft> = {}): TestDraft {
  return {
    title: 'Hello',
    slug: 'hello',
    scheduleFor: undefined,
    ...over,
  }
}

describe('reconcileSavedDraft', () => {
  it('preserves the local scheduleFor when the server returns no scheduled_for', () => {
    const picked = new Date('2026-06-01T10:00:00Z')
    const baseline = makeDraft({ scheduleFor: picked })
    const latest = makeDraft({ scheduleFor: picked })

    const { nextDraft, savedSnapshot } = reconcileSavedDraft(baseline, latest, {
      slug: 'hello',
      scheduled_for: null,
    })

    expect(nextDraft.scheduleFor).toEqual(picked)
    expect(savedSnapshot.scheduleFor).toEqual(picked)
  })

  it('IGNORES server scheduled_for and preserves the local pick (autosave never owns scheduling)', () => {
    // Real-world regression: post in DB has stale scheduled_for from earlier
    // testing. The autosave PUT echoes that stale value. We must NOT adopt it
    // and overwrite the date the user just picked locally.
    const userPicked = new Date('2026-08-19T22:00:00Z')
    const staleServerValue = '2026-05-30 23:00:00'
    const baseline = makeDraft({ scheduleFor: userPicked })
    const latest = makeDraft({ scheduleFor: userPicked })

    const { nextDraft, savedSnapshot } = reconcileSavedDraft(baseline, latest, {
      slug: 'hello',
      scheduled_for: staleServerValue,
    })

    expect(nextDraft.scheduleFor).toEqual(userPicked)
    expect(savedSnapshot.scheduleFor).toEqual(userPicked)
  })

  it('preserves a date the user picks DURING the in-flight save (race condition)', () => {
    // Save started with no date selected
    const baseline = makeDraft({ scheduleFor: undefined, title: 'Old' })
    // While the fetch was in flight, the user picked a date AND typed a new title
    const justPicked = new Date('2026-08-01T12:00:00Z')
    const latest = makeDraft({ scheduleFor: justPicked, title: 'Old typing more' })

    const { nextDraft } = reconcileSavedDraft(baseline, latest, {
      slug: 'old',
      scheduled_for: null,
    })

    expect(nextDraft.scheduleFor).toEqual(justPicked)
    expect(nextDraft.title).toBe('Old typing more')
  })

  it('still adopts a slug rewritten by the server (e.g. uniqueness suffix)', () => {
    const baseline = makeDraft({ slug: 'hello' })
    const latest = baseline

    const { nextDraft, savedSnapshot } = reconcileSavedDraft(baseline, latest, {
      slug: 'hello-2',
      scheduled_for: null,
    })

    expect(nextDraft.slug).toBe('hello-2')
    expect(savedSnapshot.slug).toBe('hello-2')
  })

  it('does not mutate baseline or latest', () => {
    const baseline = makeDraft({ scheduleFor: new Date('2026-06-01T10:00:00Z') })
    const latest = makeDraft({ scheduleFor: new Date('2026-06-01T10:00:00Z') })
    const baselineCopy = { ...baseline }
    const latestCopy = { ...latest }

    reconcileSavedDraft(baseline, latest, { slug: 'hello', scheduled_for: null })

    expect(baseline).toEqual(baselineCopy)
    expect(latest).toEqual(latestCopy)
  })
})
