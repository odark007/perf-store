'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableTextProps {
  text: string | null;
  className?: string;
}

const CopyableText: React.FC<CopyableTextProps> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  if (!text) return <span className="text-secondary-400 italic text-sm">Not provided</span>;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className={`group flex items-center gap-2 hover:bg-secondary-50 px-2 py-1 -ml-2 rounded-lg transition-colors text-left ${className}`}
      title="Click to copy email"
    >
      <span className="text-secondary-900 group-hover:text-primary-700 font-medium break-all">
        {text}
      </span>
      {copied ? (
        <Check size={14} className="text-green-600 flex-shrink-0" />
      ) : (
        <Copy size={14} className="text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      )}
      {copied && <span className="text-[10px] text-green-600 font-medium">Copied!</span>}
    </button>
  );
};

export default CopyableText;