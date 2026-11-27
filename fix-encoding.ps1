$paths = @(
  "apps\client-v2\app\components\company-pages\CompanyPages.tsx",
  "apps\client-v2\app\components\home-cards\HomeCards.module.css",
  "apps\client-v2\app\components\home-hero\HomeHero.module.css",
  "apps\client-v2\app\components\home-journey\HomeJourney.module.css",
  "apps\client-v2\app\components\home-journey\HomeJourney.tsx",
  "apps\client-v2\app\components\home-mission\HomeMission.tsx",
  "apps\client-v2\app\components\home-stories\HomeStories.module.css",
  "apps\client-v2\app\components\home-stories\HomeStories.tsx",
  "apps\client-v2\app\components\layout\Footer.tsx",
  "apps\client-v2\app\components\layout\Header.tsx",
  "apps\client-v2\app\components\layout\NewsletterBanner.tsx",
  "apps\client-v2\app\routes\insight-detail.tsx",
  "apps\client-v2\app\app.css"
)

# Build replacement pairs using char codes so the script file stays ASCII-safe
$pairs = @(
  @([char[]]@(0xC3,0xA2,0xE2,0x80,0x9A,0xC2,0xB9) -join '', [char]0x2192),  # right arrow
  @([char[]]@(0xC3,0xA2,0xE2,0x80,0x9E,0xC5,0xA1) -join '', [char]0x2019),  # right single quote
  @([char[]]@(0xC3,0xA2,0xE2,0x80,0x9E,0xC5,0x93) -join '', [char]0x201C),  # left double quote
  @([char[]]@(0xC3,0xA2,0xE2,0x80,0x9E,0xC2,0x9D) -join '', [char]0x201D),  # right double quote
  @([char[]]@(0xC3,0xA2,0xE2,0x80,0x9E,0xC2,0x9C) -join '', [char]0x2014),  # em dash
  @([char[]]@(0xC3,0xA2,0xE2,0x80,0x9E,0xC2,0xA6) -join '', [char]0x2026)   # ellipsis
)

# Simpler: just do raw string byte-level replacement via regex on known patterns
foreach ($rel in $paths) {
  $full = Join-Path "d:\My Web Sites\einao-react" $rel
  $bytes = [System.IO.File]::ReadAllBytes($full)
  $text  = [System.Text.Encoding]::UTF8.GetString($bytes)

  # Replace the actual garbled sequences (written as literal Unicode here)
  $text = $text -replace [regex]::Escape("$([char]0xC3)$([char]0xA2)$([char]0xE2)$([char]0x80)$([char]0x9A)$([char]0xC2)$([char]0xB9)"), [char]0x2192
  $text = $text -replace [regex]::Escape("$([char]0xC3)$([char]0xA2)$([char]0xE2)$([char]0x80)$([char]0x9E)$([char]0xC5)$([char]0xA1)"), [char]0x2019
  $text = $text -replace [regex]::Escape("$([char]0xC3)$([char]0xA2)$([char]0xE2)$([char]0x80)$([char]0x9E)$([char]0xC5)$([char]0x93)"), [char]0x201C
  $text = $text -replace [regex]::Escape("$([char]0xC3)$([char]0xA2)$([char]0xE2)$([char]0x80)$([char]0x9E)$([char]0xC2)$([char]0x9D)"), [char]0x201D
  $text = $text -replace [regex]::Escape("$([char]0xC3)$([char]0xA2)$([char]0xE2)$([char]0x80)$([char]0x9E)$([char]0xC2)$([char]0x9C)"), [char]0x2014
  $text = $text -replace [regex]::Escape("$([char]0xC3)$([char]0xA2)$([char]0xE2)$([char]0x80)$([char]0x9E)$([char]0xC2)$([char]0xA6)"), [char]0x2026

  [System.IO.File]::WriteAllText($full, $text, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Fixed: $([System.IO.Path]::GetFileName($full))"
}
Write-Host "All done."
