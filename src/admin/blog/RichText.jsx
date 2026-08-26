// TipTap wrapper used for prose inside a block.
//
// Scoped deliberately: it edits ONE run of ordinary text, never a whole post.
// Structural blocks (stat boxes, tables, FAQ items) are handled by the block
// model instead, because StarterKit would strip their classes and unwrap them.

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Link2, Unlink, Undo2, Redo2 } from 'lucide-react';

function ToolButton({ active, disabled, onClick, title, children }) {
  return (
    <button
      type="button" title={title} disabled={disabled}
      // A toolbar button must not steal focus from the text, or "bold" would
      // apply to nothing.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
        active ? 'bg-[#1B3172] text-white' : 'text-[#475569] hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichText({ html, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: false }),
    ],
    content: html || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2.5',
      },
    },
  });

  // Only push external changes in when they did not come from this editor —
  // otherwise every keystroke resets the cursor to the start of the block.
  useEffect(() => {
    if (editor && html !== editor.getHTML()) editor.commands.setContent(html || '', { emitUpdate: false });
  }, [html, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove)', previous);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-[#1B3172]">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-[#F8FAFC]">
        <ToolButton title="Bold" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Italic" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-3.5 h-3.5" /></ToolButton>

        <span className="w-px h-4 bg-slate-200 mx-1" />

        <ToolButton title="Bullet list" active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Numbered list" active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-3.5 h-3.5" /></ToolButton>

        <span className="w-px h-4 bg-slate-200 mx-1" />

        <ToolButton title="Add link" active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton title="Remove link" disabled={!editor.isActive('link')}
          onClick={() => editor.chain().focus().unsetLink().run()}><Unlink className="w-3.5 h-3.5" /></ToolButton>

        <div className="flex-1" />

        <ToolButton title="Undo" disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}><Undo2 className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Redo" disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}><Redo2 className="w-3.5 h-3.5" /></ToolButton>
      </div>

      <EditorContent editor={editor} />
      {placeholder && editor.isEmpty && (
        <p className="px-3 pb-2 text-xs text-[#94a3b8] -mt-6 pointer-events-none">{placeholder}</p>
      )}
    </div>
  );
}
