<div align="center">

# BIOTECH STUDY PLANNER
### DATE-WISE PLANS × REVISION TRACKING × MISTAKE LOG

![Planner](https://img.shields.io/badge/BIOTECH%20STUDY%20PLANNER-DATE--WISE%20PREP-%23F2F0EB?style=for-the-badge&labelColor=%23060608)
![Status](https://img.shields.io/badge/STATUS-LOCAL--FIRST-%23060608?style=for-the-badge&labelColor=%23060608)
![Stack](https://img.shields.io/badge/REACT%2019-TYPESCRIPT%20%2F%20VITE-%23060608?style=for-the-badge&labelColor=%23060608)
![License](https://img.shields.io/badge/License-MIT-%23060608?style=for-the-badge&labelColor=%23060608)

**A date-wise study planner for biotechnology — plan topics, track revisions, log mistakes, stay exam-ready**

[GitHub](https://github.com/adityapratap0077-cloud/aiims-biotechnology)

</div>

---

## What It Is

Biotech Study Planner is a personal command center for structured biotechnology study. It ships with a **preloaded syllabus of 44 topics across 5 subjects** — Biological Sciences & Biotechnology, Chemical Sciences, Physical Sciences, Mathematics, and General Aptitude — and turns it into a living, date-wise plan you can track to the finish line.

## Stack

`React 19` `TypeScript` `Vite 6` `Recharts` `lucide-react` `Google Gemini`

---

## Features

### Dashboard
- **Readiness Score** — weighted progress score (high-yield topics count double)
- **Countdown** — days remaining to the target date, computed live
- **Subject Progress** — per-subject completion bars, pie and bar charts via Recharts

### Syllabus Database
- 44 topics, each with status (`not-started` / `in-progress` / `mastered`), high-yield flag, recall strength, revision count, mistake count, and last-revised date
- **Preloaded high-yield notes** for every topic — concise, revision-ready

### Study Planner
- **Date-wise scheduler** — distributes every pending topic across the remaining days, high-yield topics prioritized
- **Backlog detection** — flags topics that fell behind the plan
- **Pacing** — topics-per-day calculation that rebalances as you progress

### Mistake Log
- Log mistakes per topic, typed as conceptual, silly, calculation, or recall
- Add, update, and delete entries; optional AI-generated advice per mistake

### AI Lab
- **Gemini tutor chat** — ask topic questions in a chat interface
- **Visual generator** — AI-generated study diagrams from a prompt or uploaded image
- **Note generator** — one-click study notes per topic

All data persists in `localStorage` — no backend, no account, fully local-first.

---

## Architecture

```
App.tsx               # Sidebar navigation across 5 views
components/           # Dashboard, SyllabusView, PlannerView, MistakeLogView, AILabView
services/             # storageService — localStorage persistence, topic flattening
constants.ts          # Preloaded syllabus, high-yield notes, target date
types.ts              # Topic, Chapter, Subject, MistakeLog models
```

---

## Run It

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

Optional — enable the AI Lab with a Gemini API key:

```bash
GEMINI_API_KEY=your-key-here
```

The target exam date is set in `constants.ts` (`EXAM_DATE`) — adjust it to your own timeline and the scheduler recomputes.

---

<div align="center">

**Aditya Pratap** — Creative Technologist<br>
Gorakhpur, India — [github.com/adityapratap0077-cloud](https://github.com/adityapratap0077-cloud)

</div>
