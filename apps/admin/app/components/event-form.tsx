import { Button, Card, CardContent, Input, Label, Textarea } from '@einao/ui'
import type { ReactNode } from 'react'

export type EventFormValues = {
  date: string
  name: string
  location: string
  details: string
}

export function EventFormFields({
  values,
  onChange,
  fieldErrors,
}: {
  values: EventFormValues
  onChange: (next: EventFormValues) => void
  fieldErrors?: Partial<Record<keyof EventFormValues, string>>
}) {
  function setField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <Card>
      <CardContent className="grid gap-5 pt-6">
        <Field id="event-date" label="When" error={fieldErrors?.date} hint="Free-form, e.g. ...Nov 2025... or ...Spring 2026....">
          <Input
            id="event-date"
            value={values.date}
            onChange={(e) => setField('date', e.target.value)}
            placeholder="Nov 2025"
            required
          />
        </Field>

        <Field id="event-name" label="Event name" error={fieldErrors?.name}>
          <Input
            id="event-name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Animex X Gamebridge Festival"
            required
          />
        </Field>

        <Field id="event-location" label="Location" error={fieldErrors?.location}>
          <Input
            id="event-location"
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="Middlesbrough"
            required
          />
        </Field>

        <Field
          id="event-details"
          label="Details"
          error={fieldErrors?.details}
          hint="Short description of what happened or your involvement."
        >
          <Textarea
            id="event-details"
            value={values.details}
            onChange={(e) => setField('details', e.target.value)}
            placeholder="Showcase Exhibitor (Meowsic)"
            rows={4}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function EventFormActions({
  busy,
  submitLabel,
  cancelHref = '/events',
}: {
  busy: boolean
  submitLabel: string
  cancelHref?: string
}) {
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" asChild>
        <a href={cancelHref}>Cancel</a>
      </Button>
      <Button variant="glow" type="submit" disabled={busy}>
        {busy ? 'Saving...' : submitLabel}
      </Button>
    </div>
  )
}
