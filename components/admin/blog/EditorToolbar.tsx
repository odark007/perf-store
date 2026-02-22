'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  Undo, 
  Redo 
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

const EditorToolbar: React.FC<Props> = ({ editor }) => {
  if (!editor) return null;

  const Button = ({ onClick, isActive, icon: Icon, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-secondary-100 transition-colors ${
        isActive ? 'bg-secondary-200 text-primary-700' : 'text-secondary-600'
      }`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-secondary-200 bg-secondary-50 rounded-t-lg">
      <Button 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        isActive={editor.isActive('bold')} 
        icon={Bold} 
        title="Bold" 
      />
      <Button 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        isActive={editor.isActive('italic')} 
        icon={Italic} 
        title="Italic" 
      />
      <div className="w-px h-6 bg-secondary-300 mx-1 self-center" />
      <Button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        isActive={editor.isActive('heading', { level: 2 })} 
        icon={Heading1} 
        title="Heading 1" 
      />
      <Button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
        isActive={editor.isActive('heading', { level: 3 })} 
        icon={Heading2} 
        title="Heading 2" 
      />
      <div className="w-px h-6 bg-secondary-300 mx-1 self-center" />
      <Button 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        isActive={editor.isActive('bulletList')} 
        icon={List} 
        title="Bullet List" 
      />
      <Button 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        isActive={editor.isActive('orderedList')} 
        icon={ListOrdered} 
        title="Ordered List" 
      />
      <Button 
        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
        isActive={editor.isActive('blockquote')} 
        icon={Quote} 
        title="Quote" 
      />
      <div className="w-px h-6 bg-secondary-300 mx-1 self-center" />
      <Button 
        onClick={() => editor.chain().focus().undo().run()} 
        isActive={false} 
        icon={Undo} 
        title="Undo" 
      />
      <Button 
        onClick={() => editor.chain().focus().redo().run()} 
        isActive={false} 
        icon={Redo} 
        title="Redo" 
      />
    </div>
  );
};

export default EditorToolbar;