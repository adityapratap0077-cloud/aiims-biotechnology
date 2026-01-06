import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/Card';
import { Calendar, CheckSquare, Clock, AlertTriangle, Flame, ArrowRight, RefreshCw, Bookmark, Layers, Microscope, Atom, Calculator, Beaker } from 'lucide-react';
import { EXAM_DATE } from '../constants';
import { Subject, Topic } from '../types';
import { flattenTopics } from '../services/storageService';

interface PlannerViewProps {
  syllabus: Subject[];
  onNavigate: (topicId: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ syllabus, onNavigate }) => {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    setToday(new Date());
  }, []);

  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // --- Dynamic Scheduler Logic ---
  const { schedule, backlogs, daysRemaining, topicsPerDay } = useMemo(() => {
      const allTopics = flattenTopics(syllabus);
      
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      // Target: August 31st
      // If we are currently past August, aim for next year.
      let targetYear = currentYear;
      if (currentMonth > 7) { // 7 is August
        targetYear = currentYear + 1;
      }
      
      const targetEndDate = new Date(targetYear, 7, 31); // August 31st

      // Start Date: 10th of the current month
      // If today is before the 10th, the plan starts on the 10th (future).
      // If today is after the 10th, the plan started on the 10th (past), so we check backlogs.
      const planStartDate = new Date(currentYear, currentMonth, 10);
      
      // If we are in a month where the 10th is past the target date (unlikely unless we are IN August), handle gracefully
      if (planStartDate > targetEndDate) {
          // Fallback logic, maybe start from today if weird date logic
      }

      // Total duration from Plan Start to Target
      const totalTime = targetEndDate.getTime() - planStartDate.getTime();
      const totalDaysAvailable = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
      const safeTotalDays = totalDaysAvailable > 0 ? totalDaysAvailable : 1;

      // 2. "Zero Level" Balancing Strategy
      // We need to cover ALL topics that are not mastered.
      // Prioritize High Yield. Balance Bio vs Non-Bio.
      const pendingTopics = allTopics.filter(t => t.status !== 'mastered');
      
      // Categorize
      const hyTopics = pendingTopics.filter(t => t.priority === 'high-yield');
      const normTopics = pendingTopics.filter(t => t.priority === 'normal');

      // Helper to split Bio vs Others
      const isBio = (t: Topic) => t.id.startsWith('mb') || t.id.startsWith('cg') || t.id.startsWith('ab') || t.id.startsWith('bio');
      
      const hyBio = hyTopics.filter(isBio);
      const hyOther = hyTopics.filter(t => !isBio(t));
      const normBio = normTopics.filter(isBio);
      const normOther = normTopics.filter(t => !isBio(t));

      // Construct Balanced Queue:
      // Pattern: HY Bio -> HY Other -> Norm Bio -> Norm Other (Repeat)
      // This ensures we tackle High Yield first, but keep switching subjects to avoid boredom.
      const balancedQueue: Topic[] = [];
      const maxLen = Math.max(hyBio.length, hyOther.length, normBio.length, normOther.length);
      
      for(let i=0; i<maxLen; i++) {
          if (i < hyBio.length) balancedQueue.push(hyBio[i]);
          if (i < hyOther.length) balancedQueue.push(hyOther[i]);
      }
      for(let i=0; i<maxLen; i++) {
          if (i < normBio.length) balancedQueue.push(normBio[i]);
          if (i < normOther.length) balancedQueue.push(normOther[i]);
      }
      // Add any remaining (though logic above covers most, simple concat safe check)
      const usedIds = new Set(balancedQueue.map(t => t.id));
      const remaining = pendingTopics.filter(t => !usedIds.has(t.id));
      balancedQueue.push(...remaining);

      // 3. Generate Schedule Day by Day
      // Calculate rate
      const topicsPerDayVal = Math.max(1, Math.ceil(balancedQueue.length / (safeTotalDays * 0.85))); // 0.85 factor to account for rest days

      const generatedSchedule = [];
      const calculatedBacklogs: { date: Date, topics: Topic[] }[] = [];
      
      let queueIndex = 0;
      
      // Simulate from Plan Start Date until Target Date
      for (let i = 0; i < safeTotalDays; i++) {
          const currentDate = new Date(planStartDate);
          currentDate.setDate(planStartDate.getDate() + i);
          
          // Identify constraints
          const dayOfWeek = currentDate.getDay(); // 0 = Sun
          const isRestDay = dayOfWeek === 0; // Sundays off/Revision
          
          let dailyTopics: Topic[] = [];

          if (!isRestDay && queueIndex < balancedQueue.length) {
              dailyTopics = balancedQueue.slice(queueIndex, queueIndex + topicsPerDayVal);
              queueIndex += topicsPerDayVal;
          }

          const isPast = currentDate < new Date(today.setHours(0,0,0,0));
          const isToday = currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth();

          // Calculate Backlog: If day is past and topics are NOT mastered
          if (isPast && dailyTopics.length > 0) {
              const notDone = dailyTopics.filter(t => t.status !== 'mastered');
              if (notDone.length > 0) {
                  calculatedBacklogs.push({ date: currentDate, topics: notDone });
              }
          }

          generatedSchedule.push({
              date: currentDate,
              dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
              dateStr: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              topics: dailyTopics,
              isRestDay,
              isToday,
              isPast
          });
      }

      // 4. Filter for View (Next 7 Days starting from Today)
      // Find where "Today" is in the schedule
      const todayIndex = generatedSchedule.findIndex(d => d.isToday);
      // If Today is before start date (e.g. today is 5th, start is 10th), show from start index 0
      const startIndex = todayIndex >= 0 ? todayIndex : 0;
      
      // Slice next 7 days
      const displaySchedule = generatedSchedule.slice(startIndex, startIndex + 7);

      return {
          schedule: displaySchedule,
          backlogs: calculatedBacklogs.flatMap(b => b.topics),
          daysRemaining: Math.ceil((targetEndDate.getTime() - today.getTime()) / (1000 * 3600 * 24)),
          topicsPerDay: topicsPerDayVal
      };

  }, [syllabus, today]);

  // Helper to get icon based on topic ID
  const getTopicIcon = (id: string) => {
      if (id.startsWith('mb') || id.startsWith('cg') || id.startsWith('ab')) return <Microscope size={14} />;
      if (id.startsWith('oc') || id.startsWith('pc')) return <Beaker size={14} />;
      if (id.startsWith('ma')) return <Calculator size={14} />;
      if (id.startsWith('ph')) return <Atom size={14} />;
      return <Bookmark size={14} />;
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="text-brand-500" /> Study Planner
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                <span className="bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-brand-100">Zero-to-Hero Strategy</span>
                <span className="flex items-center gap-1"><ArrowRight size={12} /> Target: Aug 31</span>
                <span className="flex items-center gap-1 text-slate-700 font-semibold"><Clock size={12} /> {daysRemaining} Days Left</span>
            </div>
        </div>
        <div className="text-right hidden md:block border-l pl-6 border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Date</p>
            <p className="text-xl font-bold text-slate-800">{formattedDate}</p>
        </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Schedule */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Weekly Calendar */}
                <Card title="Your Balanced Schedule (Next 7 Days)" className="min-h-[400px]">
                    <div className="mb-4 flex items-center justify-between">
                         <p className="text-xs text-slate-500 italic">
                            Plan starts/resets from the <strong>10th</strong>. Topics are balanced (Bio mixed with Chem/Phys).
                        </p>
                        <div className="flex gap-2 text-[10px] font-bold uppercase text-slate-400">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Bio</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Other</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> HY</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        {schedule.map((dayObj, i) => (
                            <div 
                                key={i} 
                                className={`flex flex-col border rounded-xl p-3 min-h-[160px] transition-all relative group ${
                                    dayObj.isToday 
                                    ? 'ring-2 ring-brand-500 border-transparent bg-brand-50/30 shadow-md' 
                                    : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                                }`}
                            >
                                <div className={`text-center mb-3 pb-2 border-b ${dayObj.isToday ? 'border-brand-200' : 'border-slate-100'}`}>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${dayObj.isToday ? 'text-brand-700' : 'text-slate-400'}`}>{dayObj.dayName}</span>
                                    <span className={`text-xl font-bold block ${dayObj.isToday ? 'text-brand-900' : 'text-slate-700'}`}>{dayObj.dateStr}</span>
                                </div>
                                
                                <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
                                    {dayObj.topics.length > 0 ? (
                                        dayObj.topics.map(t => {
                                            const isBio = t.id.startsWith('mb') || t.id.startsWith('cg') || t.id.startsWith('ab') || t.id.startsWith('bio');
                                            return (
                                                <div 
                                                    key={t.id} 
                                                    onClick={() => onNavigate(t.id)}
                                                    className={`text-[10px] p-2 rounded-lg border leading-tight transition-transform hover:scale-[1.02] cursor-pointer hover:shadow-md ${
                                                        isBio
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-900' // Bio Color
                                                        : 'bg-indigo-50 border-indigo-100 text-indigo-900'   // Support Color
                                                    }`}
                                                    title="Click to view in Syllabus"
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className={isBio ? "text-emerald-600" : "text-indigo-600"}>
                                                            {getTopicIcon(t.id)}
                                                        </span>
                                                        {t.priority === 'high-yield' && <Flame size={10} className="text-red-500 shrink-0" fill="currentColor" />}
                                                    </div>
                                                    <span className="font-semibold line-clamp-2">{t.name.split(':')[0]}</span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                                            {dayObj.isRestDay ? (
                                                <>
                                                    <RefreshCw size={20} className="mb-2 text-amber-400" />
                                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Revision / Rest</span>
                                                </>
                                            ) : (
                                                <span className="text-[10px]">Free Slot</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Right Column: Backlogs & Logic */}
            <div className="space-y-6">
                
                {/* Daily Target Pace Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-brand-300">
                            <Layers size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Required Velocity</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-5xl font-bold text-white tracking-tight">{topicsPerDay}</span>
                            <span className="text-sm text-slate-400 font-medium">topics / day</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1 rounded-full mb-3 overflow-hidden">
                             <div className="bg-brand-500 h-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs opacity-70 leading-relaxed">
                            Maintain this pace to finish syllabus by Aug 31.
                        </p>
                    </div>
                    {/* Decorative bg elements */}
                    <div className="absolute -right-6 -bottom-6 opacity-5 text-white rotate-12">
                        <Microscope size={140} />
                    </div>
                </div>

                {/* Backlog Section */}
                <Card className={`border-l-4 overflow-hidden ${backlogs.length > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                    <div className={`p-4 border-b flex items-center justify-between ${backlogs.length > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <h3 className={`font-bold flex items-center gap-2 ${backlogs.length > 0 ? 'text-red-800' : 'text-emerald-800'}`}>
                            {backlogs.length > 0 ? <AlertTriangle size={18} /> : <CheckSquare size={18} />} 
                            Backlogs
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${backlogs.length > 0 ? 'bg-white text-red-700 shadow-sm' : 'bg-white text-emerald-700 shadow-sm'}`}>
                            {backlogs.length} Pending
                        </span>
                    </div>
                    
                    {backlogs.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <CheckSquare size={32} className="text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 mb-1">All Caught Up!</p>
                            <p className="text-xs text-slate-500">You have no pending topics from previous scheduled days (since the 10th).</p>
                        </div>
                    ) : (
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            <div className="p-2 space-y-2">
                                <div className="px-2 py-1 bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider rounded">
                                    Missed since the 10th
                                </div>
                                {backlogs.map((t, idx) => (
                                    <div 
                                        key={t.id + idx} 
                                        onClick={() => onNavigate(t.id)}
                                        className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex items-center justify-between group hover:border-red-300 transition-all hover:shadow-md cursor-pointer"
                                        title="Click to view in Syllabus"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="text-xs font-bold text-red-400 w-5 shrink-0">#{idx + 1}</div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors">{t.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {t.priority === 'high-yield' && (
                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                                            <Flame size={8} fill="currentColor" /> HY
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">Not Done</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            className="shrink-0 ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white transition-colors" 
                                            title="Mark Done"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent navigation when just marking done (UI only for now)
                                                onNavigate(t.id); // Actually, let's just navigate to let them mark it done there for consistency
                                            }}
                                        >
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
       </div>
    </div>
  );
};