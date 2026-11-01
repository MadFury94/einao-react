import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@einao/ui'
import type { AuthorOption } from '../lib/posts'

export function AuthorPicker({
  authors,
  value,
  onChange,
}: {
  authors: AuthorOption[]
  value: number | null
  onChange: (authorId: number | null) => void
}) {
  return (
    <Select value={value?.toString() ?? ''} onValueChange={(v) => onChange(v ? Number(v) : null)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an author" />
      </SelectTrigger>
      <SelectContent>
        {authors.map((author) => (
          <SelectItem key={author.id} value={author.id.toString()}>
            <span>{author.name}</span>
            <span className="ml-2 text-xs text-muted-foreground capitalize">({author.role})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
