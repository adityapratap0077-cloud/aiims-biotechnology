import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateContent } from "../services/geminiService";
import { Image as ImageIcon, Sparkles, Loader2, Search, ExternalLink, ImagePlus, Bot, User, Download, RefreshCw, Upload, FileText, BookOpen, Save, Copy, Check, Zap, ChevronDown, Maximize2, X, FlaskConical, Leaf, HeartPulse, Calendar, ArrowUp, Clock, Target, Sliders } from 'lucide-react';
import { Subject, Topic } from '../types';
import { flattenTopics } from '../services/storageService';

interface AILabViewProps {
  syllabus: Subject[];
  onUpdateTopic?: (topicId: string, updates: Partial<Topic>) => void;
}

export const AILabView: React.FC<AILabViewProps> = ({ syllabus, onUpdateTopic }) => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'visual' | 'notes'>('tutor');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string, sources?: any[] }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [placeholderText, setPlaceholderText] = useState("Ask your Biotech Friend a question...");
  const formRef = useRef<HTMLFormElement>(null);

  // Plan Config State
  const [showPlanConfig, setShowPlanConfig] = useState(false);
  const [planSettings, setPlanSettings] = useState({
      days: 5,
      hours: 4,
      focus: ''
  });

  // Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note Generator State
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [isNoteGenerating, setIsNoteGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<{title: string, content: string, diagram?: string} | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Derived Data for Autocomplete & Selection
  const allTopics = useMemo(() => flattenTopics(syllabus), [syllabus]);
  
  const suggestions = useMemo(() => {
    // If input is empty, suggest High-Yield topics to start
    if (!chatInput.trim()) {
        return allTopics
            .filter(t => t.priority === 'high-yield')
            .slice(0, 5); 
    }
    
    // Otherwise filter by input
    const lower = chatInput.toLowerCase();
    return allTopics
      .filter(t => t.name.toLowerCase().includes(lower))
      .slice(0, 5); // Limit to 5 suggestions
  }, [chatInput, allTopics]);

  const examplePrompts = [
    "Explain PCR like I'm 5.",
    "Difference between Prokaryotic & Eukaryotic translation?",
    "Describe Michaelis-Menten kinetics.",
    "Significance of the Ramachandran plot?",
    "List high-yield topics for Immunology.",
    "Explain Agrobacterium-mediated gene transfer."
  ];

  // Dynamic Placeholder Logic
  useEffect(() => {
    if (allTopics.length === 0) return;

    const priorityTopics = allTopics.filter(t => t.status === 'in-progress' || t.priority === 'high-yield');
    const pool = priorityTopics.length > 0 ? priorityTopics : allTopics;

    const templates = [
        (t: string) => `Explain "${t}" like a friend...`,
        (t: string) => `Bhai, what is "${t}"?`,
        (t: string) => `Quiz me on "${t}"`,
        (t: string) => `Real life example of "${t}"?`,
        (t: string) => `Difference between "${t}" and...`,
        (t: string) => `Why is "${t}" important?`,
        (t: string) => `Generate a study plan for "${t}"`
    ];

    const intervalId = setInterval(() => {
        if (!chatInput) {
            const randomTopic = pool[Math.floor(Math.random() * pool.length)];
            const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
            setPlaceholderText(randomTemplate(randomTopic.name));
        }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [allTopics, chatInput]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  // Click Outside Handler for Suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset save state when generating new note
  useEffect(() => {
      setSaveSuccess(false);
      setCopySuccess(false);
      setIsImageZoomed(false);
  }, [generatedNote]);

  // Auto-load existing notes when topic selected
  useEffect(() => {
      if (selectedTopicId) {
          const topic = allTopics.find(t => t.id === selectedTopicId);
          if (topic?.notes) {
              setGeneratedNote({
                  title: topic.name,
                  content: topic.notes,
                  diagram: undefined
              });
          } else {
              setGeneratedNote(null);
          }
      }
  }, [selectedTopicId, allTopics]);

  // --- Chat Handlers ---

  const handleChatSubmit = async (e?: React.FormEvent, overrideText?: string, overrideDisplayText?: string) => {
    e?.preventDefault();
    const userMsg = overrideText || chatInput;
    const displayMsg = overrideDisplayText || userMsg;

    if (!userMsg.trim() || isChatLoading) return;

    setChatInput('');
    setShowSuggestions(false);
    setChatHistory(prev => [...prev, { role: 'user', text: displayMsg }]);
    setIsChatLoading(true);

    try {
      const response = await generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `Act as my Biotech Study Buddy. Your goal is to teach me complex topics with a 'High-Quality UI' feel.

Follow these Formatting & Style Rules:

1. **Visual UI Style:** Use horizontal lines (---) to separate sections. Use emojis as icons (e.g., 📘 for Theory, 🔬 for Lab, 🏥 for Healthcare). Use **bolding** for important keywords to make them pop.

2. **📘 The Concept:** Start with a section called '📘 The Concept'. Give a deep, step-by-step explanation of the topic. Focus on the 'logic' and 'process' first. This should be the longest part of your answer.

3. **Hinglish Language:** If I speak in Hinglish, respond in Hinglish. Keep the vibe friendly and relaxed, like we are studying together in a cafe.

4. **🌟 Real-World Application:** After the explanation, create a section called '🌟 Real-World Application'. Provide exactly 2 examples related to Healthcare, Nature, or Lab Work.

5. **The 'Quick Recap' Box:** At the end, provide a 2-line summary in a blockquote (start the line with >) so I can remember the core idea.

6. **Interactive Check-in:** End with a short friendly question.`
        },
      });

      const text = response.text || "I couldn't generate a response.";
      // @ts-ignore - Grounding types workaround
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
        .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title }));

      setChatHistory(prev => [...prev, { role: 'model', text, sources }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to Gemini." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSuggestionClick = (topicName: string, type: 'explain' | 'quiz' | 'plan' = 'explain') => {
      let prompt = '';
      switch(type) {
          case 'explain': prompt = `Explain "${topicName}" simply using real life examples.`; break;
          case 'quiz': prompt = `Quiz me on "${topicName}" with 3 conceptual questions.`; break;
          case 'plan': prompt = `Create a 1-hour revision plan for "${topicName}".`; break;
      }
      setChatInput(prompt);
      setShowSuggestions(false);
  };

  const generateCustomPlan = () => {
    setShowPlanConfig(false);
    
    // Syllabus Analysis
    const pendingHY = allTopics.filter(t => t.priority === 'high-yield' && t.status !== 'mastered');
    const weakTopics = allTopics.filter(t => t.recallStrength === 'weak');
    
    // Data limit for prompt
    const targetHY = pendingHY.slice(0, 15);
    const targetWeak = weakTopics.slice(0, 10);

    const prompt = `Act as an expert Strategy Coach for AIIMS M.Sc. Biotechnology entrance.
    
    Create a detailed **${planSettings.days}-Day Revision Plan** for me.
    
    **My Constraints:**
    - **Daily Study Time:** ${planSettings.hours} Hours
    - **Specific Focus Goal:** ${planSettings.focus || "General Balanced Revision"}
    
    **My Syllabus Context (Real Data):**
    - **PRIORITY 1 (High Yield & Pending):** ${targetHY.map(t => t.name).join(', ') || "None"}
    - **PRIORITY 2 (Weak Recall - Need Spaced Repetition):** ${targetWeak.map(t => t.name).join(', ') || "None"}
    
    **Plan Structure Required:**
    1.  **Strategy Brief:** 2-line summary of the approach.
    2.  **The Schedule (Markdown Table):** 
        - Columns: Day, Focus Area, Topics (Mix HY & Weak), Active Recall Task.
    3.  **Daily Routine:** How to split the ${planSettings.hours} hours effectively (e.g., 50m study / 10m break).
    
    Make it actionable and motivating!`;

    const displayMsg = `📅 Generating ${planSettings.days}-Day Plan (${planSettings.hours} hrs/day)...`;
    
    handleChatSubmit(undefined, prompt, displayMsg);
  };

  const handleQuickRecap = () => {
      const lastModelMsg = [...chatHistory].reverse().find(m => m.role === 'model');
      if (!lastModelMsg) return;

      const prompt = `Based on this explanation:\n\n"${lastModelMsg.text}"\n\nGenerate a "Quick Recap" as a blockquote (>). It should be exactly 2 lines summarizing the core concept.`;
      handleChatSubmit(undefined, prompt, "⚡ Quick Recap");
  };

  // --- Renderers ---

  const parseBold = (text: string) => {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  };

  // Specific Renderer for Chat Bubbles to handle the "High Quality UI" format
  const renderChatResponse = (text: string, isUser: boolean) => {
      if (isUser) return <p className="whitespace-pre-wrap font-medium">{text}</p>;

      // Detect Table rows (starting with |)
      const isTable = (line: string) => line.trim().startsWith('|');

      return text.split('\n').map((line, i) => {
          const trimmed = line.trim();
          
          // Horizontal Line (---)
          if (trimmed === '---') {
              return <hr key={i} className="my-4 border-slate-200" />;
          }

          // Headers
          if (trimmed.startsWith('📘') || trimmed.startsWith('🌟')) {
             return <h4 key={i} className="text-base font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2">{line}</h4>;
          }

          // Table handling (basic styling wrapper)
          if (isTable(trimmed)) {
             // Simple check if it's a header separator
             if (trimmed.includes('---')) return null; // skip separators in simplistic render or render customized
             
             const cells = trimmed.split('|').filter(c => c.trim() !== '');
             const isHeader = i > 0 && text.split('\n')[i+1]?.includes('---'); // Lookahead for header separator if possible, or context

             return (
                 <div key={i} className="grid grid-flow-col auto-cols-fr gap-2 border-b border-slate-100 py-2 text-sm">
                     {cells.map((cell, cIdx) => (
                         <div key={cIdx} className={isHeader ? 'font-bold bg-slate-50' : ''} dangerouslySetInnerHTML={{__html: parseBold(cell.trim())}} />
                     ))}
                 </div>
             )
          }

          // Blockquote (> Recap)
          if (trimmed.startsWith('>')) {
              return (
                  <blockquote key={i} className="border-l-4 border-brand-500 bg-brand-50/50 pl-4 py-2 pr-2 my-4 rounded-r-lg italic text-slate-700 text-sm">
                      <div dangerouslySetInnerHTML={{ __html: parseBold(trimmed.substring(1).trim()) }} />
                  </blockquote>
              );
          }

          // Bullet Points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return <li key={i} className="ml-4 list-disc my-1 text-slate-700 pl-1 marker:text-brand-400" dangerouslySetInnerHTML={{ __html: parseBold(trimmed.substring(2)) }} />;
          }

          // Default Paragraph
          if (trimmed === '') return <br key={i} />;
          return <p key={i} className="mb-2 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
      });
  };

  // --- Image Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !imagePrompt.trim() || isImageLoading) return;

    setIsImageLoading(true);

    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const response = await generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: imagePrompt },
            ],
        },
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                foundImage = true;
                break;
            }
        }
      }
      
      if (!foundImage) alert("The model didn't return an image. Try a different prompt.");

    } catch (error) {
      console.error("Image gen error:", error);
      alert("Failed to process image.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const resetVisualLab = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setImagePrompt('');
  };

  // --- Notes Generator Handlers ---

  const handleGenerateNotes = async () => {
      if(!selectedTopicId || isNoteGenerating) return;
      
      const topic = allTopics.find(t => t.id === selectedTopicId);
      if(!topic) return;

      setIsNoteGenerating(true);
      setGeneratedNote(null);

      try {
          // Parallel Execution: 1. Generate Text (Gemini 3) 2. Generate Diagram (Nano Banana / Gemini 2.5 Flash Image)
          const textPromise = generateContent({
              model: "gemini-3-flash-preview",
              contents: `Create a comprehensive, point-wise study guide for the topic: "${topic.name}".
              
              Include:
              - **Definition**: Clear and concise.
              - **Key Mechanism/Process**: Step-by-step explanation.
              - **Significance**: Why is it important in Biotechnology?
              - **High-Yield Fact**: One crucial point often asked in exams.
              
              Format using Markdown. Use bolding **text** for key terms.`
          });

          const imagePromise = generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [{ text: `A clear, scientific educational diagram explaining ${topic.name}. White background, high contrast, schematic style, labeled parts.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                }
            }
        }).catch(async (e) => {
             console.warn("Image gen failed, attempting fallback or skipping image", e);
             return null;
        });

        const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);

        const noteContent = textResponse.text || "No text generated.";
        
        let diagramUrl = undefined;
        // Handle Gemini Image Generation Response (extract inlineData)
        if (imageResponse && imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64 = part.inlineData.data;
                    diagramUrl = `data:image/png;base64,${base64}`;
                    break;
                }
            }
        }

        setGeneratedNote({
            title: topic.name,
            content: noteContent,
            diagram: diagramUrl
        });

      } catch (error) {
          console.error("Notes gen error", error);
          alert("Could not generate full notes. Please check API quota.");
      } finally {
          setIsNoteGenerating(false);
      }
  };

  const handleSaveToSyllabus = () => {
      if (!generatedNote || !selectedTopicId || !onUpdateTopic) return;
      
      onUpdateTopic(selectedTopicId, { notes: generatedNote.content });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyNotes = () => {
    if (!generatedNote) return;
    navigator.clipboard.writeText(generatedNote.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Improved Markdown Renderer for Notes Tab
  const renderMarkdown = (text: string) => {
      return text.split('\n').map((line, i) => {
        // Handle headers
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-emerald-700 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        
        // Handle Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            return <li key={i} className="ml-4 list-disc my-1 text-slate-700 pl-1" dangerouslySetInnerHTML={{ __html: parseBold(content) }} />;
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(line.trim())) {
             const content = line.trim().replace(/^\d+\.\s/, '');
             return <li key={i} className="ml-4 list-decimal my-1 text-slate-700 pl-1" dangerouslySetInnerHTML={{ __html: parseBold(content) }} />;
        }

        // Default Paragraph
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="mb-2 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
      });
  };

  const canShowRecap = !isChatLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'model';

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 relative">
      
      {/* Plan Configurator Modal */}
      {showPlanConfig && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 rounded-xl">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold flex items-center gap-2"><Sliders size={20} /> Plan Configurator</h3>
                          <p className="text-brand-100 text-sm mt-1">Design your custom revision strategy.</p>
                      </div>
                      <button 
                        onClick={() => setShowPlanConfig(false)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                  <Calendar size={14} /> Duration (Days)
                              </label>
                              <input 
                                type="number" 
                                min="1" 
                                max="30"
                                value={planSettings.days}
                                onChange={(e) => setPlanSettings(s => ({...s, days: parseInt(e.target.value)}))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 font-bold text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                  <Clock size={14} /> Daily (Hours)
                              </label>
                              <input 
                                type="number" 
                                min="1" 
                                max="16"
                                value={planSettings.hours}
                                onChange={(e) => setPlanSettings(s => ({...s, hours: parseInt(e.target.value)}))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 font-bold text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Target size={14} /> Focus Area / Goal
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. 'Only Genetics & Mol Bio' or 'Prepare for Monday Mock'"
                            value={planSettings.focus}
                            onChange={(e) => setPlanSettings(s => ({...s, focus: e.target.value}))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-400"
                          />
                          <p className="text-[10px] text-slate-400">Leave empty for a balanced revision of weak areas.</p>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 border border-slate-700">
                          <strong className="text-brand-400">AI Intelligence:</strong> I will analyze your Syllabus status to prioritize 
                          <span className="text-red-400 font-bold mx-1">High-Yield</span> topics you haven't mastered yet.
                      </div>

                      <button 
                        onClick={generateCustomPlan}
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                          <Sparkles size={18} className="text-brand-300" /> Generate Personal Plan
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="p-2.5 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg text-brand-600 shadow-sm">
                <Sparkles size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">AI Research Lab</h2>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    Powered by Gemini 3.0 <span className="w-1 h-1 rounded-full bg-slate-300"></span> Imagen
                </p>
            </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-full xl:w-auto overflow-x-auto shadow-inner">
            <button
                onClick={() => setActiveTab('tutor')}
                className={`flex-1 xl:flex-none px-4 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === 'tutor' 
                    ? 'bg-white text-brand-700 shadow ring-1 ring-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
                <Bot size={18} className={activeTab === 'tutor' ? 'text-brand-500' : ''} /> AI Buddy
            </button>
            <button
                onClick={() => setActiveTab('visual')}
                className={`flex-1 xl:flex-none px-4 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === 'visual' 
                    ? 'bg-white text-purple-700 shadow ring-1 ring-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
                <ImagePlus size={18} className={activeTab === 'visual' ? 'text-purple-500' : ''} /> Visual Lab
            </button>
            <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 xl:flex-none px-4 lg:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === 'notes' 
                    ? 'bg-white text-emerald-700 shadow ring-1 ring-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
                <BookOpen size={18} className={activeTab === 'notes' ? 'text-emerald-500' : ''} /> Smart Notes
            </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 min-h-0">
        {activeTab === 'tutor' && (
          <div className="h-full flex flex-col bg-slate-50/50 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
             {/* Chat Area */}
             <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 pb-60">
                {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="text-center opacity-80 mb-8 max-w-lg">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg border border-slate-100 transform rotate-3">
                                <Bot size={48} className="text-brand-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">Hi, I'm your Biotech Friend!</h3>
                            <p className="text-base text-slate-600 leading-relaxed">
                                I explain concepts simply using examples from <span className="font-semibold text-emerald-600">Nature</span>, <span className="font-semibold text-red-500">Healthcare</span>, and the <span className="font-semibold text-blue-500">Lab</span>.
                            </p>
                            <p className="text-sm text-slate-400 mt-2">I also speak Hinglish! "Bhai, samjha de..."</p>
                        </div>

                        {/* Smart Schedule Generator */}
                        <div className="mb-8 w-full max-w-sm px-4">
                            <button 
                                onClick={() => setShowPlanConfig(true)}
                                className="w-full group relative flex items-center gap-4 bg-white p-4 pr-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-left"
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform shrink-0">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-brand-700 transition-colors">Generate Smart Schedule</h4>
                                    <p className="text-xs text-slate-500 mt-1">AI analyzes your syllabus to create a custom plan.</p>
                                </div>
                                <div className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400 animate-pulse">
                                    <Sparkles size={16} />
                                </div>
                            </button>
                        </div>
                        
                        {/* Example Prompts Grid */}
                        <div className="w-full max-w-4xl px-4">
                            <div className="flex items-center justify-center gap-4 mb-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <span className="h-px w-8 bg-slate-300"></span>
                                Start a Conversation
                                <span className="h-px w-8 bg-slate-300"></span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {examplePrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleChatSubmit(undefined, prompt)}
                                        className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-slate-50 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:to-brand-50"></div>
                                        <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 relative z-10">{prompt}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                            msg.role === 'user' 
                            ? 'bg-brand-600 border-brand-500 text-white shadow-brand-500/20' 
                            : 'bg-white border-slate-200 text-brand-600'
                        }`}>
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={24} />}
                        </div>
                        
                        <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-6 py-4 rounded-2xl text-[15px] leading-7 shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-500/10' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                            }`}>
                                {renderChatResponse(msg.text, msg.role === 'user')}
                            </div>
                            
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pl-2 flex flex-wrap gap-2">
                                    {msg.sources.map((source, sIdx) => (
                                        <a 
                                            key={sIdx} 
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 bg-white/50 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-white transition-all"
                                        >
                                            <ExternalLink size={10} />
                                            {source.title || 'Reference'}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isChatLoading && (
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot size={24} />
                        </div>
                        <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                            <Loader2 size={18} className="animate-spin text-brand-500" />
                            <span className="text-sm font-medium text-slate-500">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input Area */}
             <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-24 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-10">
                <form ref={formRef} onSubmit={handleChatSubmit} className="relative max-w-3xl mx-auto">
                    
                    {/* Enhanced Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute bottom-full mb-3 w-full bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                             <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                                <span>{chatInput ? 'Suggested Topics' : 'Start with High-Yield'}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] normal-case font-normal text-slate-400 hidden sm:inline">Tap to select</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowSuggestions(false)}
                                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                             </div>
                             <div className="max-h-[300px] overflow-y-auto">
                                 {suggestions.map((topic) => (
                                     <div
                                        key={topic.id}
                                        className="border-b border-slate-50 last:border-0 hover:bg-brand-50/50 transition-colors group p-3"
                                     >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-800">{topic.name}</span>
                                            {topic.priority === 'high-yield' && (
                                                <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold border border-red-100">HY</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                            {[
                                                { label: 'Simplify', icon: Zap, type: 'explain', color: 'text-amber-600' },
                                                { label: 'Quiz', icon: Check, type: 'quiz', color: 'text-purple-600' },
                                                { label: 'Plan', icon: Calendar, type: 'plan', color: 'text-emerald-600' }
                                            ].map((action: any) => (
                                                <button 
                                                    key={action.type}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(topic.name, action.type)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:border-brand-300 hover:shadow-sm transition-all ${action.color}`}
                                                >
                                                    <action.icon size={12} /> {action.label}
                                                </button>
                                            ))}
                                        </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    <div className="relative group bg-white rounded-full shadow-[0_0_50px_-12px_rgb(0,0,0,0.12)] border border-slate-200 transition-all hover:border-brand-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
                        {/* Left Icon */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none">
                            <Sparkles size={20} className={isChatLoading ? "animate-pulse" : ""} />
                        </div>

                        <input
                            type="text"
                            value={chatInput}
                            onFocus={() => setShowSuggestions(true)}
                            onChange={(e) => {
                                setChatInput(e.target.value);
                                setShowSuggestions(true);
                            }}
                            placeholder={placeholderText}
                            className={`w-full bg-transparent rounded-full pl-12 py-4 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none ${canShowRecap ? 'pr-24' : 'pr-14'}`}
                        />
                        
                        {canShowRecap && (
                            <button
                                type="button"
                                onClick={handleQuickRecap}
                                className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all"
                                title="Quick Recap"
                            >
                                <Zap size={20} className="fill-current" />
                            </button>
                        )}

                        <button 
                            type="submit" 
                            disabled={!chatInput.trim() || isChatLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-full hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-90 flex items-center justify-center w-10 h-10"
                        >
                            {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={2.5} />}
                        </button>
                    </div>
                </form>
             </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Input */}
              <div className="flex flex-col gap-4 h-full">
                  <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg shrink-0">
                          <h3 className="font-bold text-slate-700 flex items-center gap-2">
                              <Upload size={18} className="text-brand-500" /> Source Material
                          </h3>
                          {selectedImage && (
                              <button onClick={resetVisualLab} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                                  <RefreshCw size={12} /> Reset
                              </button>
                          )}
                      </div>
                      
                      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                          <div 
                              onClick={() => fileInputRef.current?.click()}
                              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group min-h-[200px] ${
                                  selectedImage 
                                  ? 'border-brand-200 bg-slate-50' 
                                  : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/30'
                              }`}
                          >
                              {selectedImage ? (
                                  <div className="relative w-full h-full flex items-center justify-center bg-pattern">
                                      <img src={selectedImage} alt="Upload" className="max-w-full max-h-full object-contain p-4 shadow-sm" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <p className="text-white font-medium flex items-center gap-2"><RefreshCw size={16} /> Change Image</p>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="text-center p-8">
                                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                                          <ImagePlus className="text-slate-400 group-hover:text-brand-500" size={32} />
                                      </div>
                                      <h4 className="text-slate-700 font-bold mb-1">Upload Diagram or Notes</h4>
                                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                                  </div>
                              )}
                              <input 
                                  type="file" 
                                  ref={fileInputRef}
                                  onChange={handleImageUpload}
                                  accept="image/*"
                                  className="hidden"
                              />
                          </div>

                          <div className="space-y-3 shrink-0">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                  <Sparkles size={12} className="text-purple-500" /> AI Instruction
                              </label>
                              <div className="relative">
                                  <textarea 
                                      value={imagePrompt}
                                      onChange={(e) => setImagePrompt(e.target.value)}
                                      placeholder="Describe how to edit this image (e.g., 'Label the mitochondria', 'Remove the handwritten text', 'Convert to high contrast diagram')..."
                                      className="w-full border border-slate-200 rounded-xl p-4 text-sm h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none shadow-sm"
                                  />
                              </div>
                              <button 
                                  onClick={handleImageGeneration}
                                  disabled={!selectedImage || !imagePrompt.trim() || isImageLoading}
                                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                              >
                                  {isImageLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-purple-300" />}
                                  {isImageLoading ? 'Processing with Nano Banana...' : 'Generate Magic Edit'}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Right Panel: Result */}
              <div className="h-full">
                  <div className="h-full flex flex-col bg-slate-900 text-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
                          <h3 className="font-bold text-slate-200 flex items-center gap-2">
                              <ImageIcon size={18} className="text-purple-400" /> Generated Result
                          </h3>
                          {generatedImage && (
                            <a 
                                href={generatedImage} 
                                download="gemini-edit.png"
                                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5"
                            >
                                <Download size={12} /> Save
                            </a>
                          )}
                      </div>
                      
                      <div className="flex-1 relative flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 p-6 overflow-hidden">
                          {isImageLoading ? (
                              <div className="text-center space-y-6 max-w-xs">
                                  <div className="relative mx-auto w-20 h-20">
                                      <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin"></div>
                                      <div className="absolute inset-2 border-b-4 border-blue-500 rounded-full animate-spin animation-delay-200"></div>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                          <Sparkles size={24} className="text-white opacity-80" />
                                      </div>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-white mb-1">Gemini is working</h4>
                                    <p className="text-slate-400 text-sm">Analyzing pixels and applying your edits...</p>
                                  </div>
                              </div>
                          ) : generatedImage ? (
                              <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                                  <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-700" />
                              </div>
                          ) : (
                              <div className="text-center text-slate-600">
                                  <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <ImageIcon size={32} />
                                  </div>
                                  <p className="font-medium">Result will appear here</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        )}

        {activeTab === 'notes' && (
            <div className="h-full flex flex-col md:flex-row gap-6">
                {/* Control Panel */}
                <div className="w-full md:w-80 flex flex-col p-6 h-fit shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Smart Notes</h3>
                        <p className="text-xs text-slate-500">Generate comprehensive study guides + diagrams instantly.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Select Topic</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={14} className="text-emerald-500/70" />
                                </div>
                                <select 
                                    value={selectedTopicId}
                                    onChange={(e) => setSelectedTopicId(e.target.value)}
                                    className="w-full pl-9 pr-10 py-3.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select a topic to study...</option>
                                    {allTopics.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Image Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Normal', value: '4:3' },
                                    { label: 'Square', value: '1:1' },
                                    { label: 'Wide', value: '16:9' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setAspectRatio(opt.value)}
                                        className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all ${
                                            aspectRatio === opt.value
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateNotes}
                            disabled={!selectedTopicId || isNoteGenerating}
                            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                        >
                            {isNoteGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                            {isNoteGenerating ? 'Generating...' : 'Create Study Guide'}
                        </button>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1">
                                <Sparkles size={12} /> What you get:
                            </h4>
                            <ul className="text-[11px] text-emerald-700 space-y-2">
                                <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 shrink-0" /> Structured Markdown Notes</li>
                                <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 shrink-0" /> Key Mechanisms & Definitions</li>
                                <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 shrink-0" /> High-Yield Facts highlighted</li>
                                <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 shrink-0" /> <strong>AI Generated Diagram (Imagen)</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="flex-1 h-full min-h-0">
                    <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg shrink-0">
                            <span className="font-bold text-slate-700 flex items-center gap-2">
                                <BookOpen size={18} className="text-emerald-500" /> 
                                {generatedNote ? generatedNote.title : 'Preview'}
                            </span>
                            
                            <div className="flex items-center gap-2">
                                {generatedNote && onUpdateTopic && (
                                    <button 
                                        onClick={handleSaveToSyllabus}
                                        disabled={saveSuccess}
                                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                                            saveSuccess 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200'
                                        }`}
                                    >
                                        {saveSuccess ? <Check size={12} /> : <Save size={12} />}
                                        {saveSuccess ? 'Saved to Syllabus!' : 'Save to Topic'}
                                    </button>
                                )}
                                {generatedNote && (
                                    <button 
                                        onClick={handleCopyNotes}
                                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                                            copySuccess 
                                            ? 'bg-emerald-100 text-emerald-700 border border-transparent' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200'
                                        }`}
                                    >
                                        {copySuccess ? <Check size={12} /> : <Copy size={12} />}
                                        {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            {isNoteGenerating ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-emerald-100 rounded-full animate-pulse"></div>
                                        <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={24} className="text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-lg font-bold text-slate-700">Generating Study Material</p>
                                        <p className="text-sm text-slate-500">Writing notes & drawing scientific diagrams...</p>
                                    </div>
                                </div>
                            ) : generatedNote ? (
                                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Generated Diagram Section - Improved UI */}
                                    {generatedNote.diagram && (
                                        <>
                                            <div 
                                                className="w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-lg bg-white group transition-all hover:shadow-xl cursor-zoom-in relative"
                                                onClick={() => setIsImageZoomed(true)}
                                            >
                                                <div className="relative bg-slate-50 p-6 flex items-center justify-center min-h-[300px] border-b border-slate-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                                    <img 
                                                        src={generatedNote.diagram} 
                                                        alt={`Diagram for ${generatedNote.title}`} 
                                                        className="max-w-full h-auto max-h-[500px] object-contain rounded-lg shadow-sm mix-blend-multiply transition-transform group-hover:scale-[1.01]" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-slate-700 shadow-lg flex items-center gap-2">
                                                            <Maximize2 size={16} /> Click to Zoom
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-5 py-4 bg-white flex items-center justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                                                            <ImageIcon size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-800">Figure 1.1: AI Generated Schematic</h4>
                                                            <p className="text-xs text-slate-500 mt-0.5">Visual representation generated based on current context.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Download logic handled by anchor tag usually, but for zoom modal trigger we stop prop
                                                            }} 
                                                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Zoom Modal */}
                                            {isImageZoomed && (
                                                <div 
                                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-200"
                                                    onClick={() => setIsImageZoomed(false)}
                                                >
                                                    <button 
                                                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
                                                    >
                                                        <X size={32} />
                                                    </button>
                                                    
                                                    <img 
                                                        src={generatedNote.diagram} 
                                                        alt="Full Screen Diagram"
                                                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                                                        onClick={(e) => e.stopPropagation()} 
                                                    />

                                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                                                        <a 
                                                            href={generatedNote.diagram} 
                                                            download={`diagram-${generatedNote.title}.jpg`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center gap-2"
                                                        >
                                                            <Download size={18} /> Download Image
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Content Section */}
                                    <div className="prose prose-slate prose-sm max-w-none">
                                        <div className="font-sans">
                                            {renderMarkdown(generatedNote.content)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen size={40} className="opacity-40" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-400">Select a topic to generate notes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};