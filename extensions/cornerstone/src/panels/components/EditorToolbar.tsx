import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { Button } from '@ohif/ui-next/components/Button/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ohif/ui-next/components/Select/index';
import { Separator } from '@ohif/ui-next/components/Separator/index';

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const getActiveTextStyle = () => {
    if (editor.isActive('heading', { level: 1 })) {
      return 'h1';
    }
    if (editor.isActive('heading', { level: 2 })) {
      return 'h2';
    }
    if (editor.isActive('heading', { level: 3 })) {
      return 'h3';
    }
    if (editor.isActive('blockquote')) {
      return 'quote';
    }
    if (editor.isActive('codeBlock')) {
      return 'code';
    }
    return 'normal';
  };

  const setTextStyle = (style: string) => {
    switch (style) {
      case 'normal':
        editor.chain().focus().setParagraph().run();
        break;
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Separator
        orientation="vertical"
        className="bg-primary mx-1 h-6 w-[2px] bg-opacity-30"
      />
      {/* Text Style Dropdown */}
      <Select
        value={getActiveTextStyle()}
        onValueChange={setTextStyle}
      >
        <SelectTrigger className="text-primary h-8 w-36 bg-white text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="h1">Large Heading</SelectItem>
          <SelectItem value="h2">Medium Heading</SelectItem>
          <SelectItem value="h3">Small Heading</SelectItem>
          <SelectItem value="quote">Quote</SelectItem>
          <SelectItem value="code">Code Block</SelectItem>
        </SelectContent>
      </Select>

      <Separator
        orientation="vertical"
        className="bg-primary mx-1 h-6 w-[2px] bg-opacity-30"
      />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator
        orientation="vertical"
        className="bg-primary mx-1 h-6 w-[2px] bg-opacity-30"
      />

      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator
        orientation="vertical"
        className="bg-primary mx-1 h-6 w-[2px] bg-opacity-30"
      />

      {/* Text Alignment */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Align left clicked');
          editor.chain().focus().setTextAlign('left').run();
        }}
        className="h-8 w-8 p-0"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Align center clicked');
          editor.chain().focus().setTextAlign('center').run();
        }}
        className="h-8 w-8 p-0"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Align right clicked');
          editor.chain().focus().setTextAlign('right').run();
        }}
        className="h-8 w-8 p-0"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Align justify clicked');
          editor.chain().focus().setTextAlign('justify').run();
        }}
        className="h-8 w-8 p-0"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
    </div>
  );
};
