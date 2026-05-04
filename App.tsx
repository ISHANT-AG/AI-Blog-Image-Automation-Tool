
import React, { useState, useCallback } from 'react';
import { Sparkles, Download, RefreshCw, Trash2, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { generateBlogImage } from './services/geminiService';
import { MAX_PROMPTS } from './constants';
import { ImagePrompt, GenerationResult } from './types';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<ImagePrompt[]>([{ id: '1', text: '' }]);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addPrompt = () => {
    if (prompts.length < MAX_PROMPTS) {
      setPrompts([...prompts, { id: Math.random().toString(36).substr(2, 9), text: '' }]);
    }
  };

  const updatePrompt = (id: string, text: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, text } : p));
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const handleGenerate = async () => {
    const activePrompts = prompts.filter(p => p.text.trim().length > 0);
    if (activePrompts.length === 0) return;

    setIsGenerating(true);
    setResults(activePrompts.map(p => ({
      id: p.id,
      prompt: p.text,
      imageUrl: null,
      status: 'loading'
    })));

    // Process sequentially or in parallel? Parallel is faster.
    const generationPromises = activePrompts.map(async (p) => {
      try {
        const imageUrl = await generateBlogImage(p.text);
        setResults(prev => prev.map(res => 
          res.id === p.id ? { ...res, imageUrl, status: 'success' } : res
        ));
      } catch (err: any) {
        setResults(prev => prev.map(res => 
          res.id === p.id ? { ...res, status: 'error', errorMessage: err.message || 'Failed' } : res
        ));
      }
    });

    await Promise.all(generationPromises);
    setIsGenerating(false);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/\s+/g, '-').toLowerCase()}-clapingo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ImageIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clapingo Illustration Engine</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Internal Marketing Tool</p>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || prompts.every(p => !p.text.trim())}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95 ${
              isGenerating || prompts.every(p => !p.text.trim())
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate All
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar - Prompt Inputs */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                Prompts
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-medium">
                  {prompts.length}/{MAX_PROMPTS}
                </span>
              </h2>
            </div>
            
            <div className="space-y-3">
              {prompts.map((prompt, index) => (
                <div key={prompt.id} className="group relative">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prompt.text}
                      onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                      placeholder="e.g. Mastering Business English"
                      className="w-full pl-6 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                    />
                    {prompts.length > 1 && (
                      <button
                        onClick={() => removePrompt(prompt.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {prompts.length < MAX_PROMPTS && (
              <button
                onClick={addPrompt}
                className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Prompt
              </button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="text-blue-800 font-bold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Style Guide
            </h3>
            <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4 opacity-80">
              <li>Editorial vector illustration</li>
              <li>Official logo in top right</li>
              <li>1200x628 Landscape (16:9)</li>
              <li>Clean typography for headlines</li>
              <li>Soft gradients & smooth colors</li>
            </ul>
          </div>
        </aside>

        {/* Main Content - Results */}
        <section className="lg:col-span-8 space-y-6">
          {results.length === 0 ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-200 p-12">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Create</h3>
              <p className="text-slate-500 max-w-sm">
                Enter your blog topics on the left and click "Generate All" to create high-quality, branded illustrations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((result) => (
                <div key={result.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group transition-all hover:shadow-md">
                  <div className="relative aspect-[1200/628] bg-slate-100 flex items-center justify-center overflow-hidden">
                    {result.status === 'loading' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 p-6 text-center">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-sm font-semibold text-slate-700 animate-pulse">Rendering Illustration...</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest italic">Applying Brand Guidelines</p>
                      </div>
                    )}
                    
                    {result.status === 'error' && (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-red-500">
                        <AlertCircle className="w-10 h-10 mb-2" />
                        <p className="text-sm font-bold">Generation Failed</p>
                        <p className="text-xs opacity-80">{result.errorMessage}</p>
                      </div>
                    )}

                    {result.imageUrl && (
                      <img 
                        src={result.imageUrl} 
                        alt={result.prompt} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">PROMPT</div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">
                        {result.prompt}
                      </p>
                    </div>

                    {result.status === 'success' && result.imageUrl && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => downloadImage(result.imageUrl!, result.prompt)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PNG
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Clapingo Marketing Hub • Internal Use Only
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
