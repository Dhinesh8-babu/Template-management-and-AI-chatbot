
export interface Template {
  id: string;
  title: string;
  text: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}