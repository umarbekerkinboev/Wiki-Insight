
import { WikiSearchResult, WikiArticle } from '../types';

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

export const searchWikipedia = async (query: string): Promise<WikiSearchResult[]> => {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  return data.query.search || [];
};

export const getWikiArticle = async (title: string): Promise<WikiArticle> => {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text',
    format: 'json',
    origin: '*',
    disableeditsection: 'true',
  });

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.info);
  }

  return {
    title: data.parse.title,
    content: data.parse.text['*'],
    pageid: data.parse.pageid
  };
};
