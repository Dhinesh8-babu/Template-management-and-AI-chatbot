
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from "@google/genai";

// --- Gemini Service ---
const generateTemplateContent = async (prompt) => {
    // Per platform requirements, the API key is sourced directly from process.env.
    // The GoogleGenAI instance is created here to ensure it uses the latest key
    // provided by the environment upon each request.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a customer support template based on this topic: "${prompt}". Provide a concise title and the full template text.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A short, descriptive title for the template."
                        },
                        text: {
                            type: Type.STRING,
                            description: "The full content of the customer support template."
                        }
                    },
                    required: ["title", "text"]
                }
            }
        });
        
        // The model should return JSON, but we'll clean up potential markdown formatting.
        const rawText = response.text;
        const jsonString = rawText.trim().replace(/^```json\s*|```\s*$/g, '');
        
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error generating template with Gemini:", error);
        
        // Provide more specific feedback to the user.
        if (error.message.toLowerCase().includes('api key')) {
             throw new Error("AI service authentication failed. Please check your API key configuration.");
        }
        if (error instanceof SyntaxError) {
             throw new Error("The AI generated an invalid response. Please try again.");
        }

        throw new Error("An unexpected error occurred while generating the template.");
    }
};


// --- Supabase Service ---
const supabaseUrl = 'https://cmopwojiyyxhhhdggyed.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb3B3b2ppeXl4aGhoZGdneWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjgzMjAsImV4cCI6MjA3ODQ0NDMyMH0.apd2SLcK3PwgSOaNGHcpFZ2J26n-3CYOANANbT0XjaE';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const TABLE_NAME = 'templates';

const getTemplates = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const saveTemplate = async (templateData, id) => {
  if (id) {
    const { data, error } = await supabase.from(TABLE_NAME).update(templateData).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase.from(TABLE_NAME).insert([templateData]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
};

const deleteTemplate = async (id) => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// --- Icon Components ---
const ChatBubbleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 2.443 1.292 4.615 3.315 5.927L4 17.583A.5.5 0 004.5 18h11a.5.5 0 00.315-.89l-1.315-1.656A7.96 7.96 0 0018 9c0-3.866-3.582-7-8-7zM5 9a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zm4 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CopyIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const SparklesIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-15h.01M13 3h.01M11 21h.01M19 21h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// --- UI Components ---
const Header = () => (
    <div className="relative bg-blue-600 rounded-lg shadow-md p-8 mb-8 text-white text-center">
        <a
            href="https://dhinesh8-babu.github.io/Maintenance-and-insurance-tracker/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-100 transition-colors text-sm"
        >
            Go to Tracker
        </a>
        <div className="flex items-center justify-center gap-4">
            <ChatBubbleIcon className="h-10 w-10"/>
            <h1 className="text-4xl font-bold">Support Management System</h1>
        </div>
        <p className="text-lg mt-2 text-blue-200">Search, manage, and copy templates for customer communication</p>
    </div>
);

const TemplateModal = ({ template, onSave, onClose }) => {
    const [title, setTitle] = useState(template?.title || '');
    const [text, setText] = useState(template?.text || '');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, text });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{template?.id ? 'Edit Template' : 'Add New Template'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Template title"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Template content"
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Save Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AIGenerateModal = ({ onSave, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        try {
            const content = await generateTemplateContent(prompt);
            setGeneratedContent(content);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if(generatedContent) {
            onSave(generatedContent);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-purple-500" />
                    Generate Template with AI
                </h2>
                <div className="space-y-4">
                    <p className="text-gray-600">Describe the kind of template you need, and AI will generate it for you.</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., An email apologizing for a shipping delay"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : 'Generate'}
                    </button>
                    {error && <p className="text-sm text-red-500">Error: {error}</p>}
                </div>

                {generatedContent && (
                     <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <h3 className="text-lg font-semibold">Generated Content:</h3>
                        <div>
                            <label className="font-medium text-gray-700">Title</label>
                            <input type="text" readOnly value={generatedContent.title} className="w-full p-2 mt-1 bg-gray-100 border border-gray-300 rounded-md" />
                        </div>
                         <div>
                             <label className="font-medium text-gray-700">Text</label>
                            <textarea readOnly value={generatedContent.text} className="w-full h-32 p-2 mt-1 bg-gray-100 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!generatedContent}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
};

const TemplateCard = ({ template, onEdit, onDelete }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(template.text);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col border-l-4 border-blue-500 h-full">
            <div className="flex items-start gap-2 mb-2">
                <ChatBubbleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-blue-700 flex-grow">{template.title}</h3>
            </div>
            <div className="text-gray-600 flex-grow mb-4 overflow-y-auto" style={{ maxHeight: '100px' }}>
                <p className="whitespace-pre-wrap">{template.text}</p>
            </div>
            <div className="flex justify-end gap-2 text-gray-400 mt-auto">
                <div className="relative group">
                    <button
                        onClick={handleCopy}
                        className={`p-1 rounded-full transition-colors duration-200 ${isCopied ? 'text-green-500 bg-green-100' : 'hover:text-blue-600 hover:bg-gray-100'}`}
                        aria-label="Copy template text"
                        disabled={isCopied}
                    >
                        {isCopied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                    </button>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isCopied ? 'Copied!' : 'Copy'}
                    </span>
                </div>
                <div className="relative group">
                    <button onClick={() => onEdit(template)} className="p-1 rounded-full hover:text-blue-600 hover:bg-gray-100" aria-label="Edit template">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Edit
                    </span>
                </div>
                <div className="relative group">
                    <button onClick={() => onDelete(template.id)} className="p-1 rounded-full hover:text-red-600 hover:bg-gray-100" aria-label="Delete template">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                     <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Delete
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    const [templates, setTemplates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getTemplates();
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleOpenModal = (template = null) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleSaveTemplate = async (data) => {
        try {
            await saveTemplate(data, editingTemplate?.id);
            handleCloseModal();
            fetchTemplates();
        } catch (err) {
            setError(err.message);
        }
    };
    
    const handleDeleteTemplate = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await deleteTemplate(id);
                setTemplates(prev => prev.filter(t => t.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleOpenAIGenerateModal = () => {
        setIsAIGenerateModalOpen(true);
    };

    const handleCloseAIGenerateModal = () => {
        setIsAIGenerateModalOpen(false);
    };

    const handleAISave = (generatedContent) => {
        handleCloseAIGenerateModal();
        handleOpenModal(generatedContent);
    };

    const filteredTemplates = useMemo(() =>
        templates.filter(t =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.text.toLowerCase().includes(searchTerm.toLowerCase())
        ), [templates, searchTerm]);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Header />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full sm:w-auto sm:flex-grow max-w-lg">
                    <input
                        type="search"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={handleOpenAIGenerateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        <span>Generate with AI</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Add New Template</span>
                    </button>
                </div>
            </div>
            
            {isLoading && <p className="text-center text-gray-500">Loading templates...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}

            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onEdit={handleOpenModal}
                                onDelete={handleDeleteTemplate}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3">No templates found.</p>
                    )}
                </div>
            )}

            {isModalOpen && (
                <TemplateModal
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onClose={handleCloseModal}
                />
            )}
             {isAIGenerateModalOpen && (
                <AIGenerateModal
                    onSave={handleAISave}
                    onClose={handleCloseAIGenerateModal}
                />
            )}
        </div>
    );
};

// --- React DOM Render ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
