"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough,
  FaListUl, 
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaUndo,
  FaRedo,
  FaPalette,
  FaHighlighter
} from 'react-icons/fa'
import { useState } from 'react'

const MenuBar = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)

  if (!editor) {
    return null
  }

  const colors = [
    '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e'
  ]

  const ToolButton = ({ onClick, isActive, title, children, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        isActive 
          ? 'bg-purple-100 text-purple-600' 
          : 'text-gray-700 hover:bg-gray-200'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-1 sm:p-2 flex flex-wrap gap-0.5 sm:gap-1 sticky top-0 z-10">
      {/* Text Style Buttons */}
      <ToolButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <FaBold className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <FaItalic className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <FaUnderline className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <FaStrikethrough className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <div className="w-px h-6 sm:h-8 bg-gray-300 mx-0.5 sm:mx-1" />

      {/* Headings - Hidden on mobile, shown on tablet+ */}
      <div className="hidden sm:flex gap-0.5 sm:gap-1">
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolButton>

        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </ToolButton>

        <div className="w-px h-8 bg-gray-300 mx-1" />
      </div>

      {/* Lists */}
      <ToolButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <FaListUl className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <FaListOl className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <div className="w-px h-6 sm:h-8 bg-gray-300 mx-0.5 sm:mx-1" />

      {/* Quote & Code */}
      <ToolButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <FaQuoteLeft className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <FaCode className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <div className="w-px h-6 sm:h-8 bg-gray-300 mx-0.5 sm:mx-1" />

      {/* Text Color */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker)
            setShowHighlightPicker(false)
          }}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="Text Color"
        >
          <FaPalette className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        
        {showColorPicker && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-10 sm:hidden" 
              onClick={() => setShowColorPicker(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-20 max-w-[200px] sm:max-w-none">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run()
                    setShowColorPicker(false)
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform active:scale-95"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setShowColorPicker(false)
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform bg-white flex items-center justify-center text-xs"
                title="Reset Color"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker)
            setShowColorPicker(false)
          }}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="Highlight"
        >
          <FaHighlighter className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        
        {showHighlightPicker && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-10 sm:hidden" 
              onClick={() => setShowHighlightPicker(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-20 max-w-[200px] sm:max-w-none">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setHighlight({ color }).run()
                    setShowHighlightPicker(false)
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform active:scale-95"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setShowHighlightPicker(false)
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform bg-white flex items-center justify-center text-xs"
                title="Remove Highlight"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-6 sm:h-8 bg-gray-300 mx-0.5 sm:mx-1" />

      {/* Undo/Redo */}
      <ToolButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <FaUndo className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <FaRedo className="w-3 h-3 sm:w-4 sm:h-4" />
      </ToolButton>
    </div>
  )
}

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }) {
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3 sm:p-4 text-sm sm:text-base',
      },
    },
  })

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <MenuBar editor={editor} />
      <div className="prose-config">
        <EditorContent editor={editor} />
      </div>
      
      <style jsx global>{`
        .prose-config .ProseMirror {
          min-height: 150px;
        }
        
        .prose-config .ProseMirror:focus {
          outline: none;
        }
        
        .prose-config .ProseMirror h1 {
          font-size: 1.75em;
          font-weight: bold;
          margin: 0.5em 0;
          line-height: 1.2;
        }
        
        .prose-config .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          line-height: 1.3;
        }
        
        .prose-config .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
          line-height: 1.4;
        }
        
        .prose-config .ProseMirror ul,
        .prose-config .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5em 0;
        }
        
        .prose-config .ProseMirror ul {
          list-style-type: disc;
        }
        
        .prose-config .ProseMirror ol {
          list-style-type: decimal;
        }
        
        .prose-config .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .prose-config .ProseMirror blockquote {
          border-left: 4px solid #9333ea;
          padding-left: 1rem;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }
        
        .prose-config .ProseMirror pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1em 0;
          font-size: 0.875em;
        }
        
        .prose-config .ProseMirror code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
        }
        
        .prose-config .ProseMirror pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
        
        .prose-config .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        
        .prose-config .ProseMirror mark {
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
        
        .prose-config .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .prose-config .ProseMirror strong {
          font-weight: bold;
        }
        
        .prose-config .ProseMirror em {
          font-style: italic;
        }
        
        .prose-config .ProseMirror u {
          text-decoration: underline;
        }
        
        .prose-config .ProseMirror s {
          text-decoration: line-through;
        }
        
        .prose-config .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        @media (max-width: 640px) {
          .prose-config .ProseMirror {
            font-size: 14px;
          }
          
          .prose-config .ProseMirror h1 {
            font-size: 1.5em;
          }
          
          .prose-config .ProseMirror h2 {
            font-size: 1.3em;
          }
          
          .prose-config .ProseMirror h3 {
            font-size: 1.15em;
          }
        }
      `}</style>
    </div>
  )
}