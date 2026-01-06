export type TopicStatus = 'not-started' | 'in-progress' | 'mastered';
export type RecallStrength = 'none' | 'weak' | 'partial' | 'strong';
export type Priority = 'normal' | 'high-yield';

export interface Topic {
  id: string;
  name: string;
  priority: Priority;
  status: TopicStatus;
  recallStrength: RecallStrength;
  lastRevised?: string; // ISO Date
  revisionCount: number;
  mistakeCount: number;
  notes?: string;
}

export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface MistakeLog {
  id: string;
  topicId: string;
  topicName: string;
  description: string;
  date: string;
  type: 'conceptual' | 'silly' | 'calculation' | 'recall';
  aiAdvice?: string;
}

export interface StudyStats {
  totalTopics: number;
  totalHY: number;
  completedTopics: number;
  completedHY: number;
  masteredTopics: number;
  readinessScore: number;
}

export type ViewMode = 'dashboard' | 'syllabus' | 'planner' | 'mistakes' | 'ai-lab';