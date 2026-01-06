import { Subject, MistakeLog, Topic } from '../types';
import { INITIAL_SYLLABUS } from '../constants';

const STORAGE_KEY_SYLLABUS = 'aiims-msc-syllabus-v3';
const STORAGE_KEY_MISTAKES = 'aiims-msc-mistakes-v1';

export const loadSyllabus = (): Subject[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SYLLABUS);
    if (stored) {
      return JSON.parse(stored);
    }
    return INITIAL_SYLLABUS;
  } catch (error) {
    console.error("Failed to load syllabus", error);
    return INITIAL_SYLLABUS;
  }
};

export const saveSyllabus = (syllabus: Subject[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_SYLLABUS, JSON.stringify(syllabus));
  } catch (error) {
    console.error("Failed to save syllabus", error);
  }
};

export const loadMistakes = (): MistakeLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MISTAKES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveMistakes = (mistakes: MistakeLog[]) => {
  localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
};

// Flatten syllabus helper to find topics easily
export const flattenTopics = (subjects: Subject[]): Topic[] => {
  const topics: Topic[] = [];
  subjects.forEach(sub => {
    sub.chapters.forEach(chap => {
      chap.topics.forEach(topic => {
        topics.push(topic);
      });
    });
  });
  return topics;
};