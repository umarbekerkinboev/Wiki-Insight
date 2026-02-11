
export interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
  timestamp: string;
}

export interface WikiArticle {
  title: string;
  content: string;
  pageid: number;
}

export interface AiSummary {
  tldr: string;
  keyPoints: string[];
  context: string;
  funFact: string;
}

export enum AppView {
  HOME = 'home',
  RESULTS = 'results',
  ARTICLE = 'article'
}
