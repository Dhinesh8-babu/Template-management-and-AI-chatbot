
import React, { useState, useEffect, useCallback } from 'react';
import { TemplateManager } from './components/TemplateManager.tsx';
import { ChatAssistant } from './components/ChatAssistant.tsx';
import { ChatBot } from './components/ChatBot.tsx';
import type { Template } from './types.ts';
import { getTemplates, saveTemplate, deleteTemplate } from './services/supabaseService.ts';

const App: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTemplates = await getTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred while fetching templates.";
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // NOTE: For this to work, you must set up a 'templates' table in your Supabase project.
    // The table should have columns: 'id' (uuid, primary key), 'created_at' (timestamptz),
    // 'title' (text), and 'text' (text).
    // You also need to add SUPABASE_URL and SUPABASE_KEY to your environment variables.
    fetchTemplates();
  }, [fetchTemplates]);


  const handleSaveTemplate = async (data: { title: string; text: string }, id?: string) => {
    try {
      await saveTemplate(data, id);
      // Refetch templates to get the latest list including the new/updated one
      await fetchTemplates();
    } catch (err) {
      console.error("Failed to save template:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      // Optionally, set an error state to show in the UI
      setError(`Save failed: ${message}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      // Optimistically update UI
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete template:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred while deleting.";
       // Optionally, set an error state and refetch to revert optimistic update
      setError(`Delete failed: ${message}`);
      await fetchTemplates();
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            AI Customer Support Assistant
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Streamline your customer interactions with AI-powered tools.
          </p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-[80vh]">
            <TemplateManager 
              templates={templates} 
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="h-[80vh]">
            <ChatAssistant />
          </div>
          <div className="h-[80vh]">
            <ChatBot />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;