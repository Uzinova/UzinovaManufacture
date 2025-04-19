import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useState } from 'react';
import {
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Link as LinkIcon,
  Table as TableIcon, Quote, Code, Trash2, Undo, Redo, Type, Palette,
  Highlighter, Eye
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onPreview?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onPreview }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedHighlight, setSelectedHighlight] = useState('#ffeb3b');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  };

  return (
    <div className="border border-accent rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-accent p-2 flex flex-wrap gap-2 border-b border-accent">
        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleBold().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('bold') ? 'text-primary' : ''}`}
            title="Bold"
          >
            <Bold className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleItalic().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('italic') ? 'text-primary' : ''}`}
            title="Italic"
          >
            <Italic className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('underline') ? 'text-primary' : ''}`}
            title="Underline"
          >
            <Underline className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('heading', { level: 1 }) ? 'text-primary' : ''}`}
            title="Heading 1"
          >
            <Heading1 className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('heading', { level: 2 }) ? 'text-primary' : ''}`}
            title="Heading 2"
          >
            <Heading2 className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().setParagraph().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('paragraph') ? 'text-primary' : ''}`}
            title="Paragraph"
          >
            <Type className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('bulletList') ? 'text-primary' : ''}`}
            title="Bullet List"
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('orderedList') ? 'text-primary' : ''}`}
            title="Ordered List"
          >
            <ListOrdered className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().setTextAlign('left').run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive({ textAlign: 'left' }) ? 'text-primary' : ''}`}
            title="Align Left"
          >
            <AlignLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().setTextAlign('center').run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive({ textAlign: 'center' }) ? 'text-primary' : ''}`}
            title="Align Center"
          >
            <AlignCenter className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().setTextAlign('right').run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive({ textAlign: 'right' }) ? 'text-primary' : ''}`}
            title="Align Right"
          >
            <AlignRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowColorPicker(true);
            }}
            className="p-1 rounded hover:bg-background/50"
            title="Text Color"
          >
            <Palette className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowHighlightPicker(true);
            }}
            className="p-1 rounded hover:bg-background/50"
            title="Highlight"
          >
            <Highlighter className="h-5 w-5" style={{ color: selectedHighlight }} />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addImage();
            }}
            className="p-1 rounded hover:bg-background/50"
            title="Insert Image"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addLink();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('link') ? 'text-primary' : ''}`}
            title="Insert Link"
          >
            <LinkIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addTable();
            }}
            className="p-1 rounded hover:bg-background/50"
            title="Insert Table"
          >
            <TableIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleBlockquote().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('blockquote') ? 'text-primary' : ''}`}
            title="Quote"
          >
            <Quote className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().toggleCodeBlock().run();
            }}
            className={`p-1 rounded hover:bg-background/50 ${editor.isActive('codeBlock') ? 'text-primary' : ''}`}
            title="Code Block"
          >
            <Code className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-accent">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().undo().run();
            }}
            disabled={!editor.can().undo()}
            className="p-1 rounded hover:bg-background/50 disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().redo().run();
            }}
            disabled={!editor.can().redo()}
            className="p-1 rounded hover:bg-background/50 disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.chain().focus().clearContent().run();
            }}
            className="p-1 rounded hover:bg-background/50"
            title="Clear Content"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {onPreview && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreview();
            }}
            className="p-1 rounded hover:bg-background/50 ml-auto"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Editor Content */}
      <div className="bg-background p-4">
        <EditorContent editor={editor} className="prose prose-invert max-w-none" />
      </div>
      
      {/* Color Picker Dialog */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowColorPicker(false)}>
          <div className="bg-accent rounded-lg p-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Select Text Color</h3>
            <div className="grid grid-cols-8 gap-2 mb-4">
              {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                '#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#888888', '#444444'].map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-accent hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={e => {
                setSelectedColor(e.target.value);
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
      
      {/* Highlight Color Picker Dialog */}
      {showHighlightPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowHighlightPicker(false)}>
          <div className="bg-accent rounded-lg p-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Select Highlight Color</h3>
            <div className="grid grid-cols-8 gap-2 mb-4">
              {['#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
                '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffc107', '#ff5722'].map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-accent hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedHighlight(color);
                    editor.chain().focus().setHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedHighlight}
              onChange={e => {
                setSelectedHighlight(e.target.value);
                editor.chain().focus().setHighlight({ color: e.target.value }).run();
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
