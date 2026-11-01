import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { validationHook } from '../lib/validation-hook'

type Bindings = {
    RESEND_API_KEY: string
    RESEND_FROM_EMAIL?: string
}

const ContactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    subject: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

const router = new OpenAPIHono<{ Bindings: Bindings }>({ defaultHook: validationHook })

const contactRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Contact'],
    summary: 'Submit a contact form enquiry',
    request: {
        body: {
            content: { 'application/json': { schema: ContactSchema } },
            required: true,
        },
    },
    responses: {
        200: {
            description: 'Message sent',
            content: {
                'application/json': {
                    schema: z.object({ success: z.boolean(), message: z.string() }),
                },
            },
        },
        400: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: z.object({ error: z.union([z.string(), z.record(z.string(), z.array(z.string()))]) }),
                },
            },
        },
        500: {
            description: 'Failed to send',
            content: {
                'application/json': {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
})

router.openapi(contactRoute, async (c) => {
    const { name, email, subject, message } = c.req.valid('json')
    const fromEmail = c.env.RESEND_FROM_EMAIL ?? 'noreply@einaosolutions.com'
    const toEmail = 'hello@einaosolutions.com'

    if (!c.env.RESEND_API_KEY) {
        console.warn('[Contact] RESEND_API_KEY not set ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â logging enquiry only')
        console.log(`[Contact] From: ${name} <${email}> | Subject: ${subject ?? 'Website Enquiry'} | Message: ${message}`)
        return c.json({ success: true, message: 'Message received.' }, 200)
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `Einao Solutions Website <${fromEmail}>`,
                to: [toEmail],
                reply_to: email,
                subject: `[Website Enquiry] ${subject ?? 'No Subject'} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â from ${name}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #ffffff;">
            <h2 style="color: #FF002A; margin: 0 0 24px; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">
              New Website Enquiry
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #b0b0b0; width: 100px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Name</td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b0b0b0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #FF002A;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b0b0b0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Subject</td>
                <td style="padding: 8px 0; color: #ffffff;">${subject ?? 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</td>
              </tr>
            </table>
            <div style="background: #111; border-left: 3px solid #FF002A; padding: 16px 20px; border-radius: 4px;">
              <p style="margin: 0; color: #b0b0b0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message</p>
              <p style="margin: 0; color: #ffffff; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <p style="margin: 24px 0 0; color: #666; font-size: 12px;">
              Sent from einaosolutions.com contact form
            </p>
          </div>
        `,
            }),
        })

        if (!res.ok) {
            const err = await res.text()
            console.error(`[Contact] Resend error ${res.status}: ${err}`)
            return c.json({ error: 'Failed to send message. Please email us directly.' }, 500)
        }

        return c.json({ success: true, message: 'Message sent successfully!' }, 200)
    } catch (e) {
        console.error('[Contact] Network error:', e)
        return c.json({ error: 'Failed to send message. Please email us directly.' }, 500)
    }
})

export default router
