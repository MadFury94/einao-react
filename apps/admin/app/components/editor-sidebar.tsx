import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Unified, WordPress-style editor sidebar.
 *
 * Compose with `EditorSidebar.Block` (flat content) and `EditorSidebar.Section`
 * (collapsible `<details>` content). All children are stacked inside a single
 * card with hairline `divide-y` separators ... no per-section borders or gaps.
 *
 * @example
 * <EditorSidebar>
 *   <EditorSidebar.Block>
 *     <StatusVisibilityPanel ... />
 *   </EditorSidebar.Block>
 *   <EditorSidebar.Section title="Slug">
 *     <SlugField ... />
 *   </EditorSidebar.Section>
 *   <EditorSidebar.Section title="SEO" defaultOpen>
 *     ...
 *   </EditorSidebar.Section>
 * </EditorSidebar>
 */
export function EditorSidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="self-start lg:sticky lg:top-6">
      <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">{children}</div>
    </aside>
  )
}

function Block({ children, className }: { children: ReactNode; className?: string }) {
  // Block content lays itself out (e.g. StatusVisibilityPanel provides its own
  // padding). For raw content blocks pass padding via `className`.
  return <div className={className}>{children}</div>
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold">
        {title}
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  )
}

EditorSidebar.Block = Block
EditorSidebar.Section = Section
