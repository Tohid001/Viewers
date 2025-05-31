import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  isEditable: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  isEditable = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${
          !isEditable ? 'pointer-events-none' : ''
        }`,
        'data-placeholder': placeholder,
      },
    },
    editable: isEditable,
  });

  React.useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`h-[calc(100%-30px)] overflow-y-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${className} ${
        !isEditable ? 'w-full' : ''
      }`}
    >
      {isEditable && <EditorToolbar editor={editor} />}
      <div className="relative h-[calc(100%-30px)]">
        <EditorContent
          editor={editor}
          className="h-[calc(100%-30px)] transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        />
        {editor.isEmpty && isEditable && (
          <div className="pointer-events-none absolute top-4 left-4 text-gray-400">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};
