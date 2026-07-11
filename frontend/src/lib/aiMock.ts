export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AI_SUGGESTIONS = [
'What did the creative team work on last week?',
'Show open blockers.',
'Summarize this week.',
'Which project has the highest workload?'];


export const AI_GREETING =
  'Hello! I am Flowora AI. I can help you analyze team reports, identify blockers, and summarize weekly progress using your live Flowora data. What would you like to know?';

export function makeMessage(
role: 'user' | 'assistant',
content: string)
: ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date()
  };
}