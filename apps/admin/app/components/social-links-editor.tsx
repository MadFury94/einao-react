import { Button, Input, Label } from '@einao/ui'
import { Globe, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

type SocialLink = {
  label: string
  href: string
}

type IconProps = { className?: string }

// Brand icons are inline SVGs (simple-icons paths) because this version of
// lucide-react no longer ships brand/logo glyphs.
function brandSvg(path: string) {
  return function Icon({ className }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
        role="img"
      >
        <path d={path} />
      </svg>
    )
  }
}

const LinkedinIcon = brandSvg(
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z'
)
const FacebookIcon = brandSvg(
  'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
)
const XIcon = brandSvg(
  'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
)
const InstagramIcon = brandSvg(
  'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.015 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
)
const GithubIcon = brandSvg(
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z'
)
const YoutubeIcon = brandSvg(
  'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
)
const DiscordIcon = brandSvg(
  'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z'
)
const SteamIcon = brandSvg(
  'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z'
)

type Platform = {
  label: string
  icon: React.ComponentType<IconProps>
  match: (url: string) => boolean
}

const PLATFORMS: Platform[] = [
  { label: 'LinkedIn', icon: LinkedinIcon, match: (url) => /linkedin\.com/i.test(url) },
  { label: 'Facebook', icon: FacebookIcon, match: (url) => /facebook\.com|fb\.com/i.test(url) },
  { label: 'X (Twitter)', icon: XIcon, match: (url) => /twitter\.com|x\.com/i.test(url) },
  { label: 'Instagram', icon: InstagramIcon, match: (url) => /instagram\.com/i.test(url) },
  { label: 'GitHub', icon: GithubIcon, match: (url) => /github\.com/i.test(url) },
  { label: 'YouTube', icon: YoutubeIcon, match: (url) => /youtube\.com|youtu\.be/i.test(url) },
]

function detectPlatform(url: string): { label: string; icon: React.ComponentType<IconProps> } {
  const platform = PLATFORMS.find((p) => p.match(url))
  return platform ? { label: platform.label, icon: platform.icon } : { label: 'Website', icon: Globe }
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

type SocialLinksEditorProps = {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
}

export function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
  const [inputUrl, setInputUrl] = useState('')
  const [error, setError] = useState('')

  function addLink() {
    const url = inputUrl.trim()
    if (!url) return

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (starting with https://)')
      return
    }

    const { label } = detectPlatform(url)
    const duplicate = value.some((link) => link.href === url)
    if (duplicate) {
      setError('This link has already been added')
      return
    }

    onChange([...value, { label, href: url }])
    setInputUrl('')
    setError('')
  }

  function removeLink(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLink()
    }
  }

  return (
    <div className="space-y-3">
      <Label>Social Links</Label>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((link, i) => {
            const { icon: Icon, label } = detectPlatform(link.href)
            return (
              <li
                key={link.href}
                className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-muted-foreground hover:underline"
                >
                  {link.href}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-7 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeLink(i)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste a social media URL..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addLink}
          disabled={!inputUrl.trim()}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Paste a URL and the platform is detected automatically (LinkedIn, Facebook, X, Instagram,
        GitHub, YouTube).
      </p>
    </div>
  )
}

// - // Config-key aware editor: paste a URL, the platform is detected and stored in
// the matching site-config field (social_discord, social_twitter, ...).
export type SocialKey =
  | 'discord'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'github'
  | 'steam'

export const SOCIAL_KEYS: readonly SocialKey[] = [
  'discord',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'github',
  'steam',
]

type KeyedPlatform = {
  key: SocialKey
  label: string
  icon: React.ComponentType<IconProps>
  match: (url: string) => boolean
}

const KEYED_PLATFORMS: KeyedPlatform[] = [
  { key: 'discord', label: 'Discord', icon: DiscordIcon, match: (u) => /discord\.(gg|com)/i.test(u) },
  { key: 'twitter', label: 'X (Twitter)', icon: XIcon, match: (u) => /twitter\.com|x\.com/i.test(u) },
  { key: 'instagram', label: 'Instagram', icon: InstagramIcon, match: (u) => /instagram\.com/i.test(u) },
  { key: 'youtube', label: 'YouTube', icon: YoutubeIcon, match: (u) => /youtube\.com|youtu\.be/i.test(u) },
  { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, match: (u) => /linkedin\.com/i.test(u) },
  { key: 'github', label: 'GitHub', icon: GithubIcon, match: (u) => /github\.com/i.test(u) },
  { key: 'steam', label: 'Steam', icon: SteamIcon, match: (u) => /steampowered\.com|steamcommunity\.com/i.test(u) },
]

export type SocialValues = Partial<Record<SocialKey, string>>

type KeyedSocialLinksEditorProps = {
  value: SocialValues
  onChange: (next: SocialValues) => void
}

export function KeyedSocialLinksEditor({ value, onChange }: KeyedSocialLinksEditorProps) {
  const [inputUrl, setInputUrl] = useState('')
  const [error, setError] = useState('')

  const entries = KEYED_PLATFORMS.filter((p) => (value[p.key] ?? '').trim())

  function addLink() {
    const url = inputUrl.trim()
    if (!url) return

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (starting with https://)')
      return
    }

    const platform = KEYED_PLATFORMS.find((p) => p.match(url))
    if (!platform) {
      setError('Unrecognized platform. Supported: Discord, X, Instagram, YouTube, LinkedIn, GitHub, Steam.')
      return
    }

    onChange({ ...value, [platform.key]: url })
    setInputUrl('')
    setError('')
  }

  function removeLink(key: SocialKey) {
    onChange({ ...value, [key]: '' })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLink()
    }
  }

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map(({ key, label, icon: Icon }) => (
            <li
              key={key}
              className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
              <a
                href={value[key]}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-muted-foreground hover:underline"
              >
                {value[key]}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto size-7 shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeLink(key)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste a social media URL..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addLink}
          disabled={!inputUrl.trim()}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Paste a URL and the platform is detected automatically ... Discord, X, Instagram, YouTube,
        LinkedIn, GitHub, Steam.
      </p>
    </div>
  )
}



