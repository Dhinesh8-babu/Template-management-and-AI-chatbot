
import React, { useState, useMemo } from 'react';
import { Template } from '../types.ts';
import { enhanceText } from '../services/geminiService.ts';
import { TemplateItem } from './TemplateItem.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

interface TemplateManagerProps {
  templates: Template[];
  onSaveTemplate: (data: { title: string, text: string }, id?: string) => void;
  onDeleteTemplate: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ 
  templates, 
  onSaveTemplate, 
  onDeleteTemplate, 
  isLoading: isFetchingTemplates, 
  error: fetchError 
}) => {
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setCurrentTitle(template.title);
    setCurrentText(template.text);
    setCurrentId(template.id);
  };

  const handleNewTemplate = () => {
    setCurrentTitle('');
    setCurrentText('');
    setCurrentId(null);
  };

  const handleEnhance = async () => {
    if (!currentText.trim()) return;
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const enhanced = await enhanceText(currentText);
      setCurrentText(enhanced);
    } catch (err) {
      setEnhanceError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = () => {
    if (!currentText.trim() || !currentTitle.trim()) return;
    onSaveTemplate({ title: currentTitle, text: currentText }, currentId ?? undefined);
    if (!currentId) {
      handleNewTemplate();
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-full">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Template Saver</h2>
      
      <div className="flex flex-col space-y-4 flex-grow min-h-0">
        <div className="space-y-3">
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Template title..."
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            aria-label="Template Title"
          />
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Template content..."
            className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            aria-label="Template Content"
          />
        </div>

        {enhanceError && <p className="text-sm text-red-500">{enhanceError}</p>}
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !currentText.trim()}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isEnhancing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
            <span>{isEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!currentText.trim() || !currentTitle.trim()}
            className="flex-1 min-w-[80px] bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
          >
            {currentId ? 'Save' : 'Add New'}
          </button>
          <button
            onClick={handleNewTemplate}
            className="flex-1 min-w-[80px] bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors duration-200"
          >
            Clear
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col flex-grow min-h-0">
          <div className="flex justify-between items-center mb-2 gap-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex-shrink-0">Saved Templates</h3>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title..."
              className="w-full max-w-xs p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              aria-label="Search Templates"
            />
          </div>
          <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
            {isFetchingTemplates ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">Loading templates...</p>
            ) : fetchError ? (
               <p className="text-center text-red-500 py-4">{fetchError}</p>
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map(t => (
                <TemplateItem
                  key={t.id}
                  template={t}
                  onSelect={handleSelectTemplate}
                  onDelete={onDeleteTemplate}
                  isSelected={t.id === currentId}
                />
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                {templates.length > 0 ? 'No matching templates found.' : 'No templates saved yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};