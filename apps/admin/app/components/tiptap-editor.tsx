import { Button, cn } from '@einao/ui'
import { tiptapExtensions } from '@einao/utils'
import { EditorContent, useEditor } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Quote,
  Strikethrough,
} from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { MediaPicker } from './media-picker'

type JSONContent = {
  type?: string
  content?: JSONContent[]
  attrs?: Record<string, unknown>
  text?: string
  [key: string]: unknown
}

type TipTapEditorProps = {
  content: JSONContent | string
  onUpdate?: (content: JSONContent, html: string) => void
  editorRef?: React.MutableRefObject<any>
}

export function TipTapEditor({ content, onUpdate, editorRef }: TipTapEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const lastExternalContentRef = useRef<string>(
    typeof content === 'string' ? content : JSON.stringify(content)
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: tiptapExtensions,
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate min-h-[420px] max-w-none px-6 py-5 focus:outline-none sm:prose-base',
      },
    },
    onUpdate({ editor }) {
      const nextJson = editor.getJSON()
      // Mark this snapshot as editor-owned so prop sync does not immediately re-apply it.
      lastExternalContentRef.current = JSON.stringify(nextJson)
      onUpdate?.(nextJson, editor.getHTML())
    },
  })

  // Expose editor instance to parent
  useEffect(() => {
    if (editorRef) editorRef.current = editor
  }, [editor, editorRef])

  useEffect(() => {
    if (!editor) return
    const incoming = typeof content === 'string' ? content : JSON.stringify(content)
    // Only reset editor content when the change came from outside (e.g. revision restore),
    // not from the editor itself ... prevents the onUpdate ...<- setContent loop that eats keystrokes.
    if (incoming !== lastExternalContentRef.current) {
      lastExternalContentRef.current = incoming
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-card/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <ToolbarButton
            label="Bold"
            active={editor?.isActive('bold')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive('italic')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strike"
            active={editor?.isActive('strike')}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Heading 1"
            active={editor?.isActive('heading', { level: 1 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor?.isActive('heading', { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor?.isActive('heading', { level: 3 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive('bulletList')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            active={editor?.isActive('orderedList')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor?.isActive('blockquote')}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={editor?.isActive('codeBlock')}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            label="Add link"
            active={editor?.isActive('link')}
            onClick={() => {
              if (!editor) return
              const currentUrl = editor.getAttributes('link').href as string | undefined
              const nextUrl = window.prompt('Enter a URL', currentUrl ?? 'https://')
              if (nextUrl === null) return
              if (!nextUrl.trim()) {
                editor.chain().focus().unsetLink().run()
                return
              }
              editor.chain().focus().setLink({ href: nextUrl.trim() }).run()
            }}
          >
            <Link2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Insert image"
            active={false}
            onClick={() => setMediaPickerOpen(true)}
          >
            <ImagePlus className="size-4" />
          </ToolbarButton>
          {editor?.isActive('image') && (
            <>
              <ToolbarDivider />
              <span className="px-1 text-xs text-muted-foreground">Image width</span>
              {(['25%', '50%', '75%', '100%'] as const).map((width) => (
                <ToolbarButton
                  key={width}
                  label={`Set image width to ${width}`}
                  active={editor.getAttributes('image').width === width}
                  onClick={() => editor.chain().focus().updateAttributes('image', { width }).run()}
                >
                  <span className="text-[10px] font-semibold">{width.replace('%', '')}</span>
                </ToolbarButton>
              ))}
              <ToolbarButton
                label="Reset image width"
                onClick={() => editor.chain().focus().updateAttributes('image', { width: null }).run()}
              >
                <Maximize2 className="size-4" />
              </ToolbarButton>
            </>
          )}
          <ToolbarDivider />
          <ToolbarButton
            label="Align left"
            active={editor?.isActive({ textAlign: 'left' })}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align center"
            active={editor?.isActive({ textAlign: 'center' })}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            active={editor?.isActive({ textAlign: 'right' })}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Justify"
            active={editor?.isActive({ textAlign: 'justify' })}
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="size-4" />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} className="min-h-[420px] bg-background" />
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => editor?.chain().focus().setImage({ src: url }).run()}
      />
    </>
  )
}

function ToolbarButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon-sm"
      className={cn(active && 'ring-1 ring-inset ring-border')}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />
}
