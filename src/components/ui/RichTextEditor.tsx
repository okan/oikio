import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
interface RichTextEditorProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
}
function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-600'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      )}
    >
      {children}
    </button>
  )
}
export function RichTextEditor({
  label,
  placeholder = 'Yazmaya başlayın...',
  value,
  onChange,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate max-w-none focus:outline-none min-h-[150px] px-3 py-2',
      },
    },
  })
  useEffect(() => {
    if (editor && value !== htmlToMarkdown(editor.getHTML())) {
      editor.commands.setContent(markdownToHtml(value))
    }
  }, [value, editor])
  if (!editor) {
    return null
  }
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <div
        className={cn(
          'rounded-lg border border-slate-300 bg-white overflow-hidden',
          'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
          'transition-all duration-150',
          error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20'
        )}
      >
        { }
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Başlık"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Kalın"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="İtalik"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Madde listesi"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numaralı liste"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>
        { }
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<ul>(.*?)<\/ul>/gs, (_, content) => {
      return content.replace(/<li><p>(.*?)<\/p><\/li>/g, '- $1\n')
    })
    .replace(/<ol>(.*?)<\/ol>/gs, (_, content) => {
      let i = 1
      return content.replace(/<li><p>(.*?)<\/p><\/li>/g, () => `${i++}. ` + '$1\n')
    })
    .replace(/<li><p>(.*?)<\/p><\/li>/g, '- $1\n')
    .replace(/<p>(.*?)<\/p>/g, '$1\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    .trim()
}
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  return markdown
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) {
        return `<h2>${line.slice(3)}</h2>`
      }
      if (line.startsWith('- ')) {
        return `<ul><li><p>${line.slice(2)}</p></li></ul>`
      }
      if (/^\d+\. /.test(line)) {
        return `<ol><li><p>${line.replace(/^\d+\. /, '')}</p></li></ol>`
      }
      if (line.trim()) {
        let processed = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        return `<p>${processed}</p>`
      }
      return ''
    })
    .join('')
}
