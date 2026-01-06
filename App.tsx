import React, { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, Calendar, AlertOctagon, GraduationCap, Sparkles } from 'lucide-react';
import { Subject, ViewMode, Topic, MistakeLog } from './types';
import { Dashboard } from './components/Dashboard';
import { SyllabusView } from './components/SyllabusView';
import { PlannerView } from './components/PlannerView';
import { MistakeLogView } from './components/MistakeLogView';
import { AILabView } from './components/AILabView';
import { loadSyllabus, saveSyllabus, loadMistakes, saveMistakes } from './services/storageService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [syllabus, setSyllabus] = useState<Subject[]>([]);
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    setSyllabus(loadSyllabus());
    setMistakes(loadMistakes());
  }, []);

  // Persist Syllabus Changes
  useEffect(() => {
    if (syllabus.length > 0) {
      saveSyllabus(syllabus);
    }
  }, [syllabus]);

  // Persist Mistakes Changes
  useEffect(() => {
    if (mistakes.length > 0 || mistakes.length === 0) { // handle empty array save too
      saveMistakes(mistakes);
    }
  }, [mistakes]);

  const handleUpdateTopic = (topicId: string, updates: Partial<Topic>) => {
    setSyllabus(prev => prev.map(subject => ({
      ...subject,
      chapters: subject.chapters.map(chapter => ({
        ...chapter,
        topics: chapter.topics.map(topic => {
          if (topic.id === topicId) {
            return { ...topic, ...updates };
          }
          return topic;
        })
      }))
    })));
  };

  const handleAddMistake = (mistake: Omit<MistakeLog, 'id'>) => {
    const newMistake = { ...mistake, id: Date.now().toString() };
    setMistakes(prev => [newMistake, ...prev]);
  };

  const handleUpdateMistake = (id: string, updates: Partial<MistakeLog>) => {
    setMistakes(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteMistake = (id: string) => {
    setMistakes(prev => prev.filter(m => m.id !== id));
  };

  const handleNavigateToTopic = (topicId: string) => {
    setActiveView('syllabus');
    setHighlightedTopicId(topicId);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setHighlightedTopicId(null); // Clear highlight on manual navigation
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeView === view 
          ? 'bg-brand-50 text-brand-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-600">
            <GraduationCap size={28} />
            <span className="font-bold text-lg tracking-tight">AIIMS Biotech</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Command Center</p>
        </div>
        
        <nav className="p-4 space-y-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="syllabus" icon={BookOpen} label="Syllabus Database" />
          <NavItem view="planner" icon={Calendar} label="Study Planner" />
          <NavItem view="mistakes" icon={AlertOctagon} label="Mistake Log" />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem view="ai-lab" icon={Sparkles} label="AI Lab" />
          </div>
        </nav>

        <div className="p-4 mt-auto">
            <div className="bg-slate-900 rounded-lg p-4 text-white">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Phase</p>
                <p className="text-sm font-semibold">Phase 1: Foundation</p>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-12">
          {activeView === 'dashboard' && (
            <Dashboard 
              syllabus={syllabus} 
              mistakes={mistakes} 
              onNavigate={handleNavigateToTopic} 
            />
          )}
          {activeView === 'syllabus' && (
            <SyllabusView 
              syllabus={syllabus} 
              onUpdateTopic={handleUpdateTopic} 
              highlightedTopicId={highlightedTopicId} 
            />
          )}
          {activeView === 'planner' && (
            <PlannerView 
              syllabus={syllabus} 
              onNavigate={handleNavigateToTopic} 
            />
          )}
          {activeView === 'mistakes' && (
            <MistakeLogView 
              syllabus={syllabus} 
              mistakes={mistakes} 
              onAddMistake={handleAddMistake}
              onUpdateMistake={handleUpdateMistake}
              onDeleteMistake={handleDeleteMistake}
              onNavigateToTopic={handleNavigateToTopic}
            />
          )}
          {activeView === 'ai-lab' && (
            <AILabView 
              syllabus={syllabus} 
              onUpdateTopic={handleUpdateTopic} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;