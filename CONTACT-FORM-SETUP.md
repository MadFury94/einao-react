# Contact form setup

The contact form now submits through the Einao client Worker to the Resend API.

## Configure the Resend key

Run this from `D:\My Web Sites\einao-react\apps\client` and paste the key only into Wrangler’s hidden prompt:

```powershell
npx wrangler secret put RESEND_API_KEY
```

The key is stored as a Cloudflare Worker secret and is never committed to the repository or sent to the browser.

## Sender requirements

The Worker currently sends from:

```text
Einao Website <hello@einaosolutions.com>
```

That sender domain must be verified in Resend. The default recipient is `hello@einaosolutions.com`.

Optional Worker variables can override those defaults:

```powershell
npx wrangler secret put CONTACT_TO_EMAIL
npx wrangler secret put RESEND_FROM_EMAIL
```

`RESEND_FROM_EMAIL` should be a verified Resend sender, for example `Einao Website <hello@einaosolutions.com>`.

## Form behaviour

- Required fields: full name, work email, organisation, and challenge or requirement.
- Invalid submissions return an accessible error message without calling Resend.
- A hidden honeypot field filters basic automated submissions.
- The submitter’s email is sent as `Reply-To`, so replies go directly to the person who submitted the form.
- Success and failure messages are rendered in the form with status and alert semantics.
- The Worker returns a configuration message if `RESEND_API_KEY` has not been added yet.

After adding the secret, submit a real test enquiry from `/contact/` and confirm both delivery and the reply address.
