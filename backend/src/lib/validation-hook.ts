import type { Context } from 'hono'

/**
 * Shared defaultHook for OpenAPIHono routers.
 * Formats Zod validation errors as `{ field: [messages] }`.
 */
export const validationHook = (
  result: Record<string, unknown>,
  c: Context
): Response | undefined => {
  if (
    result.success === false &&
    result.error &&
    typeof result.error === 'object' &&
    'issues' in result.error
  ) {
    const issues = (result.error as { issues: { path: PropertyKey[]; message: string }[] }).issues
    const errors: Record<string, string[]> = {}
    for (const issue of issues) {
      const key = issue.path.join('.') || '_root'
      if (!errors[key]) {
        errors[key] = []
      }
      errors[key].push(issue.message)
    }
    return c.json({ success: false, error: errors }, 400)
  }
}
