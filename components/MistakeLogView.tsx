import React, { useState, useMemo } from 'react';
import { MistakeLog, Subject } from '../types';
import { Card } from './ui/Card';
import { flattenTopics } from '../services/storageService';
import { Plus, Trash2, ArrowRight, PieChart, Filter, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { generateContent } from "../services/geminiService";

interface MistakeLogViewProps {
  syllabus: Subject[];
  mistakes: MistakeLog[];
  onAddMistake: (mistake: Omit<MistakeLog, 'id'>) => void;
  onUpdateMistake: (id: string, updates: Partial<MistakeLog>) => void;
  onDeleteMistake: (id: string) => void;
  onNavigateToTopic: (topicId: string) => void;
}

export const MistakeLogView: React.FC<MistakeLogViewProps> = ({ syllabus, mistakes, onAddMistake, onUpdateMistake, onDeleteMistake, onNavigateToTopic }) => {
  const [topicId, setTopicId] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MistakeLog['type']>('conceptual');
  const [activeFilter, setActiveFilter] = useState<MistakeLog['type'] | 'all'>('all');
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const topics = flattenTopics(syllabus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId || !description) return;

    const topicName = topics.find(t => t.id === topicId)?.name || 'Unknown Topic';

    onAddMistake({
      topicId,
      topicName,
      description,
      type,
      date: new Date().toISOString()
    });

    setDescription('');
    setTopicId('');
  };

  const handleGetAIFix = async (mistake: MistakeLog) => {
      setLoadingAiId(mistake.id);
      try {
          const response = await generateContent({
              model: "gemini-3-flash-preview",
              contents: `I made a mistake while studying Biotechnology.
              
              Context:
              - Topic: ${mistake.topicName}
              - Type of Mistake: ${mistake.type} (e.g., Silly error, Conceptual gap, Calculation error, Recall failure)
              - Description: "${mistake.description}"
              
              Act as a supportive senior tutor. Give me a specific, actionable, and short (1-2 sentences) strategy to fix this specific mistake and ensure I don't repeat it.
              If it's a recall error, suggest a mnemonic. If it's conceptual, suggest an analogy. If it's silly, suggest a check-step.`
          });

          const advice = response.text;
          if (advice) {
              onUpdateMistake(mistake.id, { aiAdvice: advice });
          }
      } catch (error) {
          console.error("AI Fix Error", error);
          alert("Couldn't connect to AI Tutor.");
      } finally {
          setLoadingAiId(null);
      }
  };

  const filteredMistakes = useMemo(() => {
    if (activeFilter === 'all') return mistakes;
    return mistakes.filter(m => m.type === activeFilter);
  }, [mistakes, activeFilter]);

  const stats = useMemo(() => {
    const total = mistakes.length;
    if (total === 0) return null;
    return {
        conceptual: mistakes.filter(m => m.type === 'conceptual').length,
        silly: mistakes.filter(m => m.type === 'silly').length,
        calculation: mistakes.filter(m => m.type === 'calculation').length,
        recall: mistakes.filter(m => m.type === 'recall').length,
        total
    };
  }, [mistakes]);

  const getTypeColor = (t: string) => {
      switch(t) {
          case 'conceptual': return 'bg-red-100 text-red-700 border-red-200';
          case 'calculation': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'recall': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'silly': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  const getTypeDotColor = (t: string) => {
      switch(t) {
          case 'conceptual': return 'bg-red-500';
          case 'calculation': return 'bg-amber-500';
          case 'recall': return 'bg-purple-500';
          case 'silly': return 'bg-blue-500';
          default: return 'bg-slate-500';
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Mistake Log</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Section */}
            <Card className="md:col-span-1 h-fit">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={20} /> Log New Mistake
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Topic</label>
                        <select 
                            className="w-full text-sm border-slate-200 rounded-md focus:ring-brand-500 focus:border-brand-500"
                            value={topicId}
                            onChange={(e) => setTopicId(e.target.value)}
                        >
                            <option value="">Select Topic...</option>
                            {topics.map(t => (
                                <option key={t.id} value={t.id}>{t.name.substring(0, 40)}...</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Error Type</label>
                        <div className="flex flex-wrap gap-2">
                            {(['conceptual', 'silly', 'calculation', 'recall'] as const).map(t => (
                                <button
                                    type="button"
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                        type === t 
                                        ? getTypeColor(t) + ' ring-1 ring-offset-1 ring-slate-300'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-slate-600 uppercase mb-1">What went wrong?</label>
                         <textarea 
                            className="w-full text-sm border-slate-200 rounded-md focus:ring-brand-500 focus:border-brand-500"
                            rows={3}
                            placeholder="I forgot the enzyme name..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                         />
                    </div>

                    <button 
                        type="submit"
                        disabled={!topicId || !description}
                        className="w-full bg-slate-900 text-white font-semibold py-2 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        Add to Log
                    </button>
                </form>
            </Card>

            {/* List and Analysis Section */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Analysis Stats */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex flex-col items-center">
                            <span className="text-2xl font-bold text-red-600">{stats.conceptual}</span>
                            <span className="text-[10px] uppercase font-bold text-red-400">Conceptual</span>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex flex-col items-center">
                            <span className="text-2xl font-bold text-purple-600">{stats.recall}</span>
                            <span className="text-[10px] uppercase font-bold text-purple-400">Recall</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex flex-col items-center">
                            <span className="text-2xl font-bold text-amber-600">{stats.calculation}</span>
                            <span className="text-[10px] uppercase font-bold text-amber-400">Calc</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col items-center">
                            <span className="text-2xl font-bold text-blue-600">{stats.silly}</span>
                            <span className="text-[10px] uppercase font-bold text-blue-400">Silly</span>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
                    {(['all', 'conceptual', 'recall', 'calculation', 'silly'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-colors ${
                                activeFilter === filter 
                                ? 'bg-slate-800 text-white border-slate-800' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredMistakes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                            <p className="text-slate-400 font-medium text-sm">
                                {mistakes.length === 0 ? "No mistakes logged yet." : "No mistakes found for this filter."}
                            </p>
                        </div>
                    ) : (
                        filteredMistakes.map(m => (
                            <div 
                                key={m.id} 
                                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md group relative overflow-hidden"
                            >
                                <div className="flex gap-4">
                                    <div className={`w-1 shrink-0 rounded-full ${getTypeDotColor(m.type)} self-stretch`} />
                                    
                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 
                                                    onClick={() => onNavigateToTopic(m.topicId)}
                                                    className="font-bold text-slate-800 text-sm hover:text-brand-600 transition-colors cursor-pointer flex items-center gap-2"
                                                >
                                                    {m.topicName}
                                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getTypeColor(m.type)} border bg-opacity-50`}>
                                                        {m.type}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(m.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => onDeleteMistake(m.id)} 
                                                className="text-slate-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                                title="Delete Mistake"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        
                                        {/* Description */}
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {m.description}
                                        </p>

                                        {/* AI Section */}
                                        <div className="mt-4">
                                            {m.aiAdvice ? (
                                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg p-3 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                                    <div className="bg-white p-1.5 rounded-full shadow-sm h-fit text-emerald-600">
                                                        <Lightbulb size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-emerald-800 mb-0.5">Strategy Fix</p>
                                                        <p className="text-xs text-emerald-700 leading-relaxed">{m.aiAdvice}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleGetAIFix(m)}
                                                    disabled={loadingAiId === m.id}
                                                    className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-70"
                                                >
                                                    {loadingAiId === m.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Sparkles size={14} />
                                                    )}
                                                    {loadingAiId === m.id ? 'Analyzing Mistake...' : 'Ask AI How to Fix'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};