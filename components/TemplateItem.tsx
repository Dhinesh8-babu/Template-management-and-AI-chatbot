
import React, { useState } from 'react';
import { Template } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';

interface TemplateItemProps {
  template: Template;
  onSelect: (template: Template) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export const TemplateItem: React.FC<TemplateItemProps> = ({ template, onSelect, onDelete, isSelected }) => {
  const [copied, setCopied] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(template.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(template.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div
      onClick={() => onSelect(template)}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
          : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate">
            {template.title}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 break-words mt-1">
            {template.text}
          </p>
        </div>
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-blue-500 transition-colors duration-200"
            aria-label="Copy template text"
          >
            {copied ? <span className="text-xs text-blue-500">Copied!</span> : <CopyIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
            aria-label="Delete template"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
