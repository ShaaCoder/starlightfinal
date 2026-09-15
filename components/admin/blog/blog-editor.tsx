'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Code, Undo, Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function BlogEditor({ content, onChange }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      isInternalUpdate.current = true;
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="" class="rounded-xl max-w-full" />`);
    }
  }, [execCommand]);

  const tools = [
    { icon: Heading1, command: 'formatBlock', value: '<h2>', title: 'Heading 2' },
    { icon: Heading2, command: 'formatBlock', value: '<h3>', title: 'Heading 3' },
    { icon: Heading3, command: 'formatBlock', value: '<h4>', title: 'Heading 4' },
    { type: 'separator' as const },
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { type: 'separator' as const },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: '<blockquote>', title: 'Quote' },
    { icon: Code, command: 'formatBlock', value: '<pre>', title: 'Code Block' },
    { type: 'separator' as const },
    { icon: LinkIcon, command: 'customLink', title: 'Insert Link' },
    { icon: ImageIcon, command: 'customImage', title: 'Insert Image' },
    { type: 'separator' as const },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 bg-slate-50 border-b border-slate-200 px-2 py-1.5">
        {tools.map((tool, i) => {
          if (tool.type === 'separator') {
            return <div key={i} className="w-px h-6 bg-slate-200 mx-1" />;
          }
          const handleClick = () => {
            if (tool.command === 'customLink') insertLink();
            else if (tool.command === 'customImage') insertImage();
            else execCommand(tool.command, (tool as { value?: string }).value);
          };
          return (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className="h-8 w-8 p-0 hover:bg-slate-200 text-slate-600"
              title={tool.title}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-6 focus:outline-none
          prose prose-slate max-w-none
          prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-3
          prose-h3:text-xl prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-slate-700 prose-p:leading-relaxed
          prose-blockquote:border-sky-300 prose-blockquote:bg-sky-50/50
          prose-ul:my-3 prose-ol:my-3
          prose-li:text-slate-700"
        suppressContentEditableWarning
      />
    </div>
  );
}
