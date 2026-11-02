import {
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  ThemeToggle,
  Toaster,
  TooltipProvider,
} from '@einao/ui'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import { AdminSidebar } from './components/admin-sidebar'
import { NavigationProgress } from './components/navigation-progress'
import { API_BASE_URL } from './lib/api'
import './app.css'

export function meta() {
  return [{ title: 'Einao Admin' }]
}

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/einao-logo.png', type: 'image/png' },
  { rel: 'shortcut icon', href: '/einao-logo.png', type: 'image/png' },
  { rel: 'apple-touch-icon', href: '/einao-logo.png' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap',
  },
]

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env as unknown as Record<string, unknown>
  const hasBinding = Boolean(env.API)
  const apiFetch = hasBinding
    ? (env.API as { fetch: typeof fetch }).fetch.bind(env.API)
    : globalThis.fetch
  const baseUrl = hasBinding ? 'https://einao-api.einaodevv.workers.dev' : API_BASE_URL

  const res = await apiFetch(`${baseUrl}/api/v1/admin/me`, {
    headers: {
      Cookie: request.headers.get('Cookie') ?? '',
    },
  })

  if (!res.ok) {
    return { status: 'unauthorized' as const, user: null }
  }

  const user = (await res.json()) as { id: number; name: string; email: string; role: string }
  return { status: 'authenticated' as const, user }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark', background: '#0c1710' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
          __html: `(function(){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';document.documentElement.style.background='#0c1710'})()`,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  if (loaderData.status === 'unauthorized') {
    return <LoginScreen />
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <NavigationProgress />
        <AdminSidebar user={loaderData.user} />
        <SidebarInset className="min-w-0 bg-muted/20">
          <header
            className="sticky top-0 z-30 flex h-12 sm:h-14 shrink-0 items-center gap-2 border-b bg-background/20 px-3 sm:px-4 backdrop-blur supports-backdrop-filter:bg-background/60"
          >
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">Admin Console</span>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="min-w-0 flex-1 p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
        <Toaster position="top-right" richColors closeButton />
      </SidebarProvider>
    </TooltipProvider>
  )
}

function LoginScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <LoginForm />
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loginUrl = `${API_BASE_URL}/api/v1/auth/login`
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (res.status === 429) {
        setError('Too many requests. Please wait a few minutes.')
        return
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error || 'Invalid email or password.')
        return
      }
      window.location.reload()
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Einao Admin</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the admin panel.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="admin-error">
      <p className="admin-eyebrow">Admin Error</p>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="admin-error-stack">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
