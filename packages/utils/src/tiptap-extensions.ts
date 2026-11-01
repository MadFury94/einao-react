import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

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
 * Shared TipTap extensions used by admin editor and backend HTML renderer.
 * Keep in sync Ã¢â‚¬â€ adding an extension here ensures both sides understand the content.
 */
export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    link: false,
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
  Placeholder.configure({
    placeholder: 'Write somethingÃ¢â‚¬Â¦',
  }),
  Typography,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
]
