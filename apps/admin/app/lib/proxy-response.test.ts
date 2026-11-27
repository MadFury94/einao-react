import { describe, expect, it } from 'vitest'
import { proxyApiResponse } from './proxy-response'

const admin = 'https://einao-admin.einaodevv.workers.dev'
const loginCookie = 'einao_session=test-token; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.einaodevv.workers.dev'
const proxy = (url: string, cookie: string) => proxyApiResponse(new Response('{}', {headers:{'Set-Cookie':cookie}}), new Request(url))

describe('proxied session cookie scope', () => {
  it('shares production login with the client and expires the old admin-only cookie', () => {
    const cookies = proxy(admin + '/api/v1/auth/login', loginCookie).headers.getSetCookie()
    expect(cookies).toHaveLength(2)
    expect(cookies[0]).toContain('Max-Age=0')
    expect(cookies[0]).not.toContain('Domain=')
    expect(cookies[1]).toContain('Domain=einaodevv.workers.dev')
    expect(cookies[1]).toContain('einao_session=test-token')
    expect(cookies[1]).toContain('HttpOnly; Secure; SameSite=Lax')
  })
  it('expires shared and legacy cookies on logout', () => {
    const cookies = proxy(admin + '/api/v1/auth/logout', 'einao_session=; Max-Age=0; Path=/; Domain=.einaodevv.workers.dev').headers.getSetCookie()
    expect(cookies).toHaveLength(2)
    expect(cookies.every(cookie => cookie.includes('Max-Age=0'))).toBe(true)
    expect(cookies[1]).toContain('Domain=einaodevv.workers.dev')
  })
  it.each(['http://127.0.0.1:5931', 'http://localhost:5931', 'https://admin.example.com', 'https://einao-admin.einaodevv.workers.dev.example.com'])('keeps cookies host-only on %s', host => {
    const cookies = proxy(host, loginCookie).headers.getSetCookie()
    expect(cookies).toHaveLength(1)
    expect(cookies[0]).not.toContain('Domain=')
  })
  it('does not create a session on failed login', () => {
    const result = proxyApiResponse(new Response('denied', {status:401}), new Request(admin))
    expect(result.status).toBe(401)
    expect(result.headers.getSetCookie()).toEqual([])
  })
  it('preserves separate non-session cookies without sharing them', () => {
    const headers = new Headers()
    headers.append('Set-Cookie', loginCookie)
    headers.append('Set-Cookie', 'preference=one; Path=/; Domain=.einaodevv.workers.dev')
    const result = proxyApiResponse(new Response('{}', {headers}), new Request(admin))
    expect(result.headers.getSetCookie()).toHaveLength(3)
    expect(result.headers.getSetCookie()[2]).toBe('preference=one; Path=/')
  })
})
