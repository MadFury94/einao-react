import type { JSONContent } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
      },
    }
  },
})

/**
 * Server-side extensions for HTML generation (no Placeholder needed).
 */
const serverExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
  }),
  ResizableImage.configure({
    allowBase64: false,
    HTMLAttributes: { loading: 'lazy', decoding: 'async' },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
  }),
  Typography,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  CodeBlockLowlight,
]

/**
 * Render TipTap JSON content to HTML string.
 * Used by the backend to generate content_html from content_json.
 */
export function renderTiptapHTML(doc: JSONContent): string {
  return generateHTML(doc, serverExtensions)
}
