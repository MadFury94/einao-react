import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@einao/ui'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'

type Category = { id: number; name: string }

export function CategoryPicker({
  availableCategories,
  value,
  onChange,
  placeholder = 'Select categories',
  errors,
}: {
  availableCategories: Category[]
  value: number[]
  onChange: (ids: number[]) => void
  placeholder?: string
  errors?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const hasError = errors && errors.length > 0

  const sorted = [...availableCategories].sort((a, b) => a.name.localeCompare(b.name))
  const selectedCategories = sorted.filter((c) => value.includes(c.id))

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  function remove(id: number) {
    onChange(value.filter((v) => v !== id))
  }

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`h-9 w-full justify-between font-normal ${
              hasError ? 'border-destructive focus-visible:ring-destructive/40' : ''
            }`}
          >
            <span className="text-muted-foreground">
              {value.length === 0
                ? placeholder
                : `${value.length} categor${value.length === 1 ? 'y' : 'ies'} selected`}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
        >
          <Command>
            <CommandInput placeholder="Search categories" value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup heading="Categories">
                {sorted.map((category) => {
                  const isSelected = value.includes(category.id)
                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => toggle(category.id)}
                    >
                      <div
                        className={`mr-2 flex size-4 items-center justify-center rounded-sm border ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected && <Check className="size-3" />}
                      </div>
                      {category.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.map((category) => (
            <Badge key={category.id} variant="secondary" className="gap-1 pr-1">
              {category.name}
              <button
                type="button"
                aria-label={`Remove ${category.name}`}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => remove(category.id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {hasError && <p className="text-xs text-destructive">{errors.join(', ')}</p>}
    </div>
  )
}
