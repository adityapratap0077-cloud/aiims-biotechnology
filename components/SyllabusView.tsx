import React, { useState, useEffect } from 'react';
import { Subject, Topic, TopicStatus, RecallStrength } from '../types';
import { ChevronDown, ChevronRight, Flame, Check, Brain, RotateCcw, StickyNote, Sparkles, Loader2, Save, Edit3, Eye } from 'lucide-react';
import { Card } from './ui/Card';
import { GoogleGenAI } from "@google/genai";

interface SyllabusViewProps {
  syllabus: Subject[];
  onUpdateTopic: (topicId: string, updates: Partial<Topic>) => void;
  highlightedTopicId?: string | null;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({ syllabus, onUpdateTopic, highlightedTopicId }) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [isEditingMap, setIsEditingMap] = useState<Record<string, boolean>>({});
  const [showHyOnly, setShowHyOnly] = useState(false);
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);

  // Handle auto-expansion and scrolling when highlightedTopicId changes
  useEffect(() => {
    if (highlightedTopicId) {
      // Find the subject containing the topic
      const subjectToExpand = syllabus.find(s => 
        s.chapters.some(c => c.topics.some(t => t.id === highlightedTopicId))
      );
      
      if (subjectToExpand) {
        setExpandedSubjects(prev => ({ ...prev, [subjectToExpand.id]: true }));
        
        // Slight delay to allow DOM to update after expansion
        setTimeout(() => {
          const element = document.getElementById(highlightedTopicId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect class
            element.classList.add('ring-2', 'ring-brand-500', 'ring-offset-2', 'bg-brand-50');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-brand-500', 'ring-offset-2', 'bg-brand-50');
            }, 2000);
          }
        }, 100);
      }
    }
  }, [highlightedTopicId, syllabus]);

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNote = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateNotes = async (topicId: string, topicName: string, chapterName: string, subjectName: string) => {
    setGeneratingTopicId(topicId);
    // Switch to edit mode briefly or ensure we are ready to receive
    // Actually better to switch to View mode after generation to see result
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: `Write detailed, exam-oriented study notes for the topic "${topicName}" (Subject: ${subjectName}, Chapter: ${chapterName}). 
            
            Structure the notes with:
            1. 📌 Key Concepts & Definitions
            2. ⚙️ Mechanisms / Processes (Step-by-step)
            3. 💡 High-Yield Facts (What usually comes in exams)
            4. ⚠️ Common Pitfalls/Mistakes
            
            Format nicely with Markdown (bolding, lists, headers). Keep it concise but comprehensive.`
        });
        
        const generatedText = response.text;
        if (generatedText) {
            onUpdateTopic(topicId, { notes: generatedText });
            // Force View mode to see the result
            setIsEditingMap(prev => ({ ...prev, [topicId]: false }));
        }
    } catch (error) {
        console.error("Failed to generate notes:", error);
        alert("Could not generate notes. Please check your connection.");
    } finally {
        setGeneratingTopicId(null);
    }
  };

  const handleManualSave = (topicId: string) => {
    setSavingTopicId(topicId);
    setTimeout(() => setSavingTopicId(null), 2000);
  };

  // Helper for markdown rendering
  const parseBold = (text: string) => {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  };

  const renderMarkdown = (text: string) => {
      if (!text) return <p className="text-slate-400 italic">No notes yet. Click 'Edit' to write or 'Auto-Generate' to use AI.</p>;

      return text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="text-base font-bold text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-1">{line.replace('## ', '')}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-3">{line.replace('# ', '')}</h2>;
        
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return <li key={i} className="ml-5 list-disc my-1 text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: parseBold(line.substring(2)) }} />;
        }
        
        if (/^\d+\.\s/.test(line.trim())) {
             return <li key={i} className="ml-5 list-decimal my-1 text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: parseBold(line.replace(/^\d+\.\s/, '')) }} />;
        }

        if (line.trim() === '') return <div key={i} className="h-2"></div>;
        
        return <p key={i} className="text-sm text-slate-700 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
      });
  };

  const statusColors: Record<TopicStatus, string> = {
    'not-started': 'bg-slate-100 text-slate-500',
    'in-progress': 'bg-blue-100 text-blue-700',
    'mastered': 'bg-emerald-100 text-emerald-700',
  };

  const recallValueMap: Record<RecallStrength, number> = {
    'none': 0,
    'weak': 1,
    'partial': 2,
    'strong': 3
  };

  const valueRecallMap: Record<number, RecallStrength> = {
    0: 'none',
    1: 'weak',
    2: 'partial',
    3: 'strong'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Syllabus Database</h2>
           <p className="text-slate-500 text-sm">The single source of truth. Track status and recall strength.</p>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <input 
                type="checkbox" 
                checked={showHyOnly}
                onChange={(e) => setShowHyOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <span className={`text-sm font-semibold ${showHyOnly ? 'text-red-600' : 'text-slate-600'}`}>
                High-Yield Only Mode 🔥
            </span>
        </label>
      </div>

      <div className="space-y-4">
        {syllabus.map(subject => {
            // Filter logic within render to keep structure
            const hasVisibleTopics = subject.chapters.some(ch => 
                ch.topics.some(t => !showHyOnly || t.priority === 'high-yield')
            );
            
            if (!hasVisibleTopics) return null;

            return (
                <Card key={subject.id} className="p-0 overflow-hidden">
                    <button 
                        onClick={() => toggleSubject(subject.id)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <span className="font-bold text-lg text-slate-800">{subject.name}</span>
                        {expandedSubjects[subject.id] ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    
                    {expandedSubjects[subject.id] && (
                        <div className="border-t border-slate-200 divide-y divide-slate-100">
                            {subject.chapters.map(chapter => {
                                const visibleTopics = chapter.topics.filter(t => !showHyOnly || t.priority === 'high-yield');
                                if (visibleTopics.length === 0) return null;

                                return (
                                    <div key={chapter.id} className="p-6">
                                        <h4 className="font-semibold text-slate-700 mb-4">{chapter.name}</h4>
                                        <div className="space-y-2">
                                            {visibleTopics.map(topic => {
                                                const isEditing = isEditingMap[topic.id] ?? (topic.notes ? false : true);

                                                return (
                                                <div 
                                                    id={topic.id}
                                                    key={topic.id} 
                                                    className={`
                                                        flex flex-col gap-2 p-3 rounded-md border transition-all duration-300
                                                        ${topic.priority === 'high-yield' ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-white'}
                                                    `}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            {topic.priority === 'high-yield' && (
                                                                <Flame className="text-red-500 shrink-0 mt-1" size={18} fill="currentColor" fillOpacity={0.2} />
                                                            )}
                                                            <div>
                                                                <p className={`font-medium ${topic.priority === 'high-yield' ? 'text-slate-900' : 'text-slate-700'}`}>
                                                                    {topic.name}
                                                                </p>
                                                                <div className="flex gap-2 text-xs mt-1 text-slate-500">
                                                                    <span>Rev: {topic.revisionCount}</span>
                                                                    {topic.priority === 'high-yield' && <span className="text-red-600 font-bold">[HY]</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                                                            {/* Status Selector */}
                                                            <select 
                                                                value={topic.status}
                                                                onChange={(e) => onUpdateTopic(topic.id, { status: e.target.value as TopicStatus })}
                                                                className={`text-xs font-semibold px-2 py-1.5 rounded border-0 cursor-pointer focus:ring-2 ring-blue-200 outline-none ${statusColors[topic.status]}`}
                                                            >
                                                                <option value="not-started">Not Started</option>
                                                                <option value="in-progress">In Progress</option>
                                                                <option value="mastered">Mastered</option>
                                                            </select>

                                                            {/* Recall Slider */}
                                                            <div className="flex flex-col w-28 mx-1 gap-1 select-none">
                                                                <div className="flex justify-between items-center px-0.5">
                                                                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                                                                        <Brain size={12} />
                                                                    </div>
                                                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                                                                        topic.recallStrength === 'strong' ? 'text-emerald-600' :
                                                                        topic.recallStrength === 'partial' ? 'text-amber-600' :
                                                                        topic.recallStrength === 'weak' ? 'text-red-500' :
                                                                        'text-slate-300'
                                                                    }`}>
                                                                        {topic.recallStrength === 'none' ? 'None' : topic.recallStrength}
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="3"
                                                                    step="1"
                                                                    value={recallValueMap[topic.recallStrength]}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        onUpdateTopic(topic.id, { recallStrength: valueRecallMap[val] });
                                                                    }}
                                                                    className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-100
                                                                        [&::-webkit-slider-thumb]:appearance-none 
                                                                        [&::-webkit-slider-thumb]:w-3.5 
                                                                        [&::-webkit-slider-thumb]:h-3.5 
                                                                        [&::-webkit-slider-thumb]:rounded-full 
                                                                        [&::-webkit-slider-thumb]:transition-all
                                                                        [&::-webkit-slider-thumb]:shadow-sm
                                                                        [&::-moz-range-thumb]:w-3.5 
                                                                        [&::-moz-range-thumb]:h-3.5 
                                                                        [&::-moz-range-thumb]:rounded-full 
                                                                        [&::-moz-range-thumb]:border-none
                                                                        [&::-moz-range-thumb]:shadow-sm
                                                                        ${topic.recallStrength === 'strong' ? '[&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:bg-emerald-500' :
                                                                          topic.recallStrength === 'partial' ? '[&::-webkit-slider-thumb]:bg-amber-500 [&::-moz-range-thumb]:bg-amber-500' :
                                                                          topic.recallStrength === 'weak' ? '[&::-webkit-slider-thumb]:bg-red-500 [&::-moz-range-thumb]:bg-red-500' :
                                                                          '[&::-webkit-slider-thumb]:bg-slate-400 [&::-moz-range-thumb]:bg-slate-400'
                                                                        }
                                                                    `}
                                                                />
                                                            </div>

                                                            {/* Action Buttons Group */}
                                                            <div className="flex items-center gap-1">
                                                                <button 
                                                                    onClick={() => toggleNote(topic.id)}
                                                                    className={`p-1.5 rounded transition-colors ${
                                                                        expandedNotes[topic.id] || (topic.notes && topic.notes.length > 0)
                                                                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                                                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                                                    }`}
                                                                    title={topic.notes ? "View/Edit Notes" : "Add Note"}
                                                                >
                                                                    <StickyNote size={16} fill={topic.notes && topic.notes.length > 0 ? "currentColor" : "none"} />
                                                                </button>
                                                                
                                                                <button 
                                                                    onClick={() => onUpdateTopic(topic.id, { revisionCount: topic.revisionCount + 1, lastRevised: new Date().toISOString() })}
                                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                                    title="Mark as Revised"
                                                                >
                                                                    <RotateCcw size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Notes Area */}
                                                    {expandedNotes[topic.id] && (
                                                        <div className="mt-3 pl-0 md:pl-8 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            <div className="bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden shadow-sm">
                                                                {/* Toolbar */}
                                                                <div className="flex items-center justify-between px-4 py-2 border-b border-yellow-100 bg-yellow-100/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-yellow-800 uppercase tracking-wide flex items-center gap-1">
                                                                            <StickyNote size={14} /> Study Notes
                                                                        </span>
                                                                        {/* View/Edit Toggle */}
                                                                        <button
                                                                            onClick={() => setIsEditingMap(prev => ({...prev, [topic.id]: !isEditing}))}
                                                                            className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded bg-white/50 hover:bg-white text-yellow-800 border border-yellow-200/50 transition-colors ml-2"
                                                                        >
                                                                            {isEditing ? <Eye size={12} /> : <Edit3 size={12} />}
                                                                            {isEditing ? 'Preview' : 'Edit'}
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-2">
                                                                        {/* Save Button */}
                                                                         <button
                                                                            onClick={() => handleManualSave(topic.id)}
                                                                            className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                                                                savingTopicId === topic.id 
                                                                                ? 'bg-emerald-100 text-emerald-700' 
                                                                                : 'bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-50'
                                                                            }`}
                                                                        >
                                                                            {savingTopicId === topic.id ? <Check size={12} /> : <Save size={12} />}
                                                                            {savingTopicId === topic.id ? 'Saved' : 'Save'}
                                                                        </button>
                                                                        
                                                                        {/* Generate Button */}
                                                                        <button 
                                                                            onClick={() => handleGenerateNotes(topic.id, topic.name, chapter.name, subject.name)}
                                                                            disabled={generatingTopicId === topic.id}
                                                                            className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                                                        >
                                                                            {generatingTopicId === topic.id ? (
                                                                                <Loader2 size={12} className="animate-spin" />
                                                                            ) : (
                                                                                <Sparkles size={12} />
                                                                            )}
                                                                            {generatingTopicId === topic.id ? 'Thinking...' : 'Gemini 3.0'}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Body */}
                                                                <div className="p-0">
                                                                    {isEditing ? (
                                                                        <div className="relative">
                                                                            <textarea
                                                                                className="w-full text-sm p-4 bg-yellow-50 focus:bg-white focus:outline-none transition-colors min-h-[350px] resize-y text-slate-700 leading-relaxed block font-mono"
                                                                                placeholder="Add specific notes..."
                                                                                value={topic.notes || ''}
                                                                                onChange={(e) => onUpdateTopic(topic.id, { notes: e.target.value })}
                                                                            />
                                                                            <div className="absolute right-3 bottom-2 text-[10px] text-slate-400 pointer-events-none italic">
                                                                                Auto-saved locally
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="prose prose-sm max-w-none p-6 text-slate-800 bg-white min-h-[150px]">
                                                                            {renderMarkdown(topic.notes || '')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )})}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            );
        })}
      </div>
    </div>
  );
};