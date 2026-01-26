import React from 'react';

interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

interface CommandProps {
  cmd: string;
  comment?: string;
}

export function Terminal({ title = 'bash', children, className = '' }: TerminalProps): React.ReactElement {
  return (
    <div className={`rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
        </div>
        <div className="text-xs text-zinc-500 font-mono">{title}</div>
        <div className="w-10"></div>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function CodeBlock({ code }: CodeBlockProps): React.ReactElement {
  return (
    <pre className="text-zinc-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {code}
    </pre>
  );
}

export function Command({ cmd, comment }: CommandProps): React.ReactElement {
  return (
    <div className="mb-2">
      <div className="flex text-zinc-100">
        <span className="text-zinc-500 mr-2">$</span>
        <span>{cmd}</span>
      </div>
      {comment && <div className="text-zinc-500 text-xs mt-1 ml-4"># {comment}</div>}
    </div>
  );
}
