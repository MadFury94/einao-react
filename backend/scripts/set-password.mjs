/**
 * Set a password for an admin user.
 * Usage: node scripts/set-password.mjs <email> <password> [--remote]
 */
import { execSync } from 'node:child_process'

const args = process.argv.slice(2)
const remote = args.includes('--remote')
const filteredArgs = args.filter((a) => a !== '--remote')

if (filteredArgs.length < 2) {
  console.error('Usage: node scripts/set-password.mjs <email> <password> [--remote]')
  process.exit(1)
}

const [email, password] = filteredArgs

// Hash using the same PBKDF2 approach as the backend
const encoder = new TextEncoder()
const salt = crypto.getRandomValues(new Uint8Array(16))
const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
  'deriveBits',
])
const hash = await crypto.subtle.deriveBits(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  keyMaterial,
  256
)
const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, '0')).join('')
const hashHex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
const passwordHash = `${saltHex}:${hashHex}`

const sql = `UPDATE users SET password_hash = '${passwordHash}' WHERE email = '${email.toLowerCase()}';`

const flag = remote ? '--remote' : '--local'
const cmd = `npx wrangler d1 execute einao_db ${flag} --command "${sql}"`

console.log(`Setting password for ${email} (${remote ? 'remote' : 'local'})...`)
try {
  execSync(cmd, { cwd: process.cwd(), stdio: 'inherit' })
  console.log(`Password set successfully for ${email}`)
} catch (e) {
  console.error(`Failed to set password for ${email}`)
  process.exit(1)
}
