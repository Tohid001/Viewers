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
      className={`flex flex-1 flex-col overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm ${className} ${
        !isEditable ? 'w-full' : ''
      }`}
    >
      {isEditable && <EditorToolbar editor={editor} />}

      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
      />
    </div>
  );
};
