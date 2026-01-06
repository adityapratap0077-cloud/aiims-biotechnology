import React, { useMemo } from 'react';
import { Subject, StudyStats, MistakeLog } from '../types';
import { flattenTopics } from '../services/storageService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Card } from './ui/Card';
import { AlertCircle, CheckCircle2, Flame, Timer, TrendingUp, Brain, ArrowRight, Target, AlertOctagon, Microscope, Beaker, Atom, Calculator, Book } from 'lucide-react';
import { EXAM_DATE } from '../constants';

interface DashboardProps {
  syllabus: Subject[];
  mistakes: MistakeLog[];
  onNavigate: (topicId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ syllabus, mistakes, onNavigate }) => {
  
  // 1. Calculate General Stats
  const stats: StudyStats = useMemo(() => {
    const allTopics = flattenTopics(syllabus);
    const hyTopics = allTopics.filter(t => t.priority === 'high-yield');
    
    const completed = allTopics.filter(t => t.status === 'mastered').length;
    const completedHY = hyTopics.filter(t => t.status === 'mastered').length;
    
    // Readiness Score Calculation
    const score = allTopics.reduce((acc, t) => {
      let val = 0;
      if (t.status === 'mastered') val = 1;
      else if (t.status === 'in-progress') val = 0.4;
      if (t.priority === 'high-yield') val *= 2; // Double points for HY
      return acc + val;
    }, 0);
    
    const maxScore = allTopics.reduce((acc, t) => acc + (t.priority === 'high-yield' ? 2 : 1), 0);

    return {
      totalTopics: allTopics.length,
      totalHY: hyTopics.length,
      completedTopics: completed,
      completedHY: completedHY,
      masteredTopics: allTopics.filter(t => t.status === 'mastered').length,
      readinessScore: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    };
  }, [syllabus]);

  // 2. Days Remaining
  const daysLeft = useMemo(() => {
    const today = new Date();
    const exam = new Date(EXAM_DATE);
    const diff = exam.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }, []);

  // 3. Subject-wise Progress
  const subjectStats = useMemo(() => {
    return syllabus.map(subject => {
        const topics = flattenTopics([subject]);
        const completed = topics.filter(t => t.status === 'mastered').length;
        const total = topics.length;
        
        let color = 'bg-slate-500';
        let icon = Book;
        
        if (subject.id === 'bio-sci') { color = 'bg-emerald-500'; icon = Microscope; }
        else if (subject.id === 'chem-sci') { color = 'bg-amber-500'; icon = Beaker; }
        else if (subject.id === 'phys-sci') { color = 'bg-indigo-500'; icon = Atom; }
        else if (subject.id === 'math') { color = 'bg-slate-600'; icon = Calculator; }
        else if (subject.id === 'aptitude') { color = 'bg-pink-500'; icon = Brain; }

        return {
            id: subject.id,
            name: subject.name.replace(/^\d+\.\s/, ''), // Remove numbering
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            color,
            icon
        };
    });
  }, [syllabus]);

  // 4. Smart Recommendations (The "Engine")
  const recommendedTopics = useMemo(() => {
      const all = flattenTopics(syllabus);
      return all
        .filter(t => t.status !== 'mastered')
        .sort((a, b) => {
            // Priority 1: High Yield
            if (a.priority === 'high-yield' && b.priority !== 'high-yield') return -1;
            if (a.priority !== 'high-yield' && b.priority === 'high-yield') return 1;
            
            // Priority 2: Mistake Count (Fix weak areas)
            if (b.mistakeCount !== a.mistakeCount) return b.mistakeCount - a.mistakeCount;

            // Priority 3: Recall Strength (Weakest first)
            const recallOrder = { 'none': 0, 'weak': 1, 'partial': 2, 'strong': 3 };
            return recallOrder[a.recallStrength] - recallOrder[b.recallStrength];
        })
        .slice(0, 4);
  }, [syllabus]);

  // 5. Mistake Analytics
  const mistakeStats = useMemo(() => {
      return [
          { name: 'Conceptual', value: mistakes.filter(m => m.type === 'conceptual').length, color: '#ef4444' },
          { name: 'Recall', value: mistakes.filter(m => m.type === 'recall').length, color: '#a855f7' },
          { name: 'Calculation', value: mistakes.filter(m => m.type === 'calculation').length, color: '#f59e0b' },
          { name: 'Silly', value: mistakes.filter(m => m.type === 'silly').length, color: '#3b82f6' },
      ].filter(d => d.value > 0);
  }, [mistakes]);

  // Pie Data
  const pieData = [
    { name: 'Mastered', value: stats.completedTopics, color: '#10b981' }, 
    { name: 'Remaining', value: stats.totalTopics - stats.completedTopics, color: '#e2e8f0' },
  ];

  const revisionsDue = useMemo(() => {
      return flattenTopics(syllabus).filter(t => t.status === 'mastered' && (t.recallStrength === 'weak' || t.recallStrength === 'partial')).length;
  }, [syllabus]);

  return (
    <div className="space-y-6">
      
      {/* --- HERO STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-600 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Readiness</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.readinessScore}%</h3>
            </div>
            <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Weighted by HY topics</p>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">HY Mastery</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {stats.completedHY}<span className="text-lg text-slate-400 font-medium">/{stats.totalHY}</span>
              </h3>
            </div>
            <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
              <Flame size={24} fill="currentColor" fillOpacity={0.2} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
             <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(stats.completedHY / stats.totalHY) * 100}%` }}></div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Countdown</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{daysLeft}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500">
              <Timer size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Days to Exam</p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Mistakes Logged</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{mistakes.length}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500">
              <AlertOctagon size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">{revisionsDue} topics need review</p>
        </Card>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Focus & Progress */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Smart Recommendations */}
            <Card title="Focus Zone: Recommended for Today">
                <div className="space-y-3">
                    {recommendedTopics.length > 0 ? (
                        recommendedTopics.map(topic => (
                            <div key={topic.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-lg shrink-0 ${topic.priority === 'high-yield' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                        {topic.priority === 'high-yield' ? <Flame size={16} fill="currentColor" /> : <Target size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{topic.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            {topic.recallStrength === 'weak' && (
                                                <span className="text-[10px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Weak Recall</span>
                                            )}
                                            {topic.status === 'not-started' && (
                                                <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">New</span>
                                            )}
                                            {topic.mistakeCount > 0 && (
                                                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{topic.mistakeCount} Mistakes</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onNavigate(topic.id)}
                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-200"
                                >
                                    Start <ArrowRight size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                            <p className="font-bold text-slate-700">All caught up!</p>
                            <p className="text-xs text-slate-500">Great job. Review mastered topics or take a break.</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Subject Mastery Progress */}
            <Card title="Subject Proficiency">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {subjectStats.map(sub => (
                        <div key={sub.id}>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <sub.icon size={16} className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500">{sub.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${sub.color} transition-all duration-1000`} 
                                    style={{ width: `${sub.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 text-right">{sub.completed}/{sub.total} Topics</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        {/* RIGHT COL: Analytics */}
        <div className="space-y-6">
            
            {/* Overall Pie Chart */}
            <Card className="flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="w-full text-left font-semibold text-slate-800 mb-2 border-b border-slate-50 pb-2">Overall Progress</h3>
                <div className="h-56 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold text-slate-800">{Math.round((stats.completedTopics / stats.totalTopics) * 100)}%</span>
                        <span className="text-xs text-slate-500 font-medium">Done</span>
                    </div>
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Mastered
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div> Remaining
                    </div>
                </div>
            </Card>

            {/* Mistake Analytics */}
            <Card>
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                     <h3 className="font-semibold text-slate-800">Error Breakdown</h3>
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{mistakes.length} Total</span>
                </div>
                
                {mistakeStats.length > 0 ? (
                    <div className="space-y-3">
                        {mistakeStats.map(stat => (
                            <div key={stat.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                                    <span className="text-xs font-medium text-slate-600">{stat.name}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                    <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(stat.value / mistakes.length) * 100}%`, backgroundColor: stat.color }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 w-4 text-right">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                        <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-lg">
                            <p className="text-[10px] text-brand-700 leading-relaxed">
                                <strong>Tip:</strong> You have {mistakeStats[0]?.value} {mistakeStats[0]?.name.toLowerCase()} errors. 
                                {mistakeStats[0]?.name === 'Conceptual' ? ' Use the AI Lab to simplify these topics.' : 
                                 mistakeStats[0]?.name === 'Recall' ? ' Try active recall or flashcards.' : ' Double check your work.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        No mistakes logged yet.
                    </div>
                )}
            </Card>

        </div>
      </div>
    </div>
  );
};