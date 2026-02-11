
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, WikiSearchResult, WikiArticle, AiSummary } from './types';
import { searchWikipedia, getWikiArticle } from './services/wikiService';
import { generateArticleInsights } from './services/geminiService';
import SearchInput from './components/SearchInput';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiSearchResult[]>([]);
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);
    try {
      const data = await searchWikipedia(searchQuery);
      setResults(data);
      setView(AppView.RESULTS);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenArticle = useCallback(async (title: string) => {
    setLoading(true);
    setView(AppView.ARTICLE);
    setAiSummary(null);
    try {
      const art = await getWikiArticle(title);
      setArticle(art);
      
      // Fetch AI Insights in background
      setAiLoading(true);
      generateArticleInsights(art.title, art.content)
        .then(summary => setAiSummary(summary))
        .catch(err => console.error("AI Insight error", err))
        .finally(() => setAiLoading(false));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const goHome = () => {
    setView(AppView.HOME);
    setQuery('');
    setResults([]);
    setArticle(null);
    setAiSummary(null);
  };

  // Views rendering logic
  if (view === AppView.HOME) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <h1 className="text-6xl font-bold mb-8 tracking-tighter text-gray-800">
            Wiki<span className="text-blue-600">Insight</span>
          </h1>
          <SearchInput onSearch={handleSearch} className="w-full max-w-2xl" autoFocus />
          <div className="mt-8 flex gap-4">
            <button className="px-6 py-2 bg-gray-50 text-gray-700 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
              I'm Feeling Curious
            </button>
            <button className="px-6 py-2 bg-gray-50 text-gray-700 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
              AI Summaries
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (view === AppView.RESULTS) {
    return (
      <Layout>
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-4 sm:px-8 flex flex-col sm:flex-row items-center gap-4">
          <button onClick={goHome} className="text-2xl font-bold tracking-tighter text-gray-800">
            Wiki<span className="text-blue-600">Insight</span>
          </button>
          <SearchInput initialValue={query} onSearch={handleSearch} className="w-full max-w-xl" />
        </header>
        
        <div className="max-w-4xl px-4 sm:px-8 py-6">
          <p className="text-sm text-gray-500 mb-6">About {results.length} results</p>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {results.map((result) => (
                <div key={result.pageid} className="group">
                  <span className="text-sm text-gray-600 block mb-1">https://en.wikipedia.org/wiki/{result.title.replace(/ /g, '_')}</span>
                  <button 
                    onClick={() => handleOpenArticle(result.title)}
                    className="text-xl text-blue-800 hover:underline block mb-1 font-medium text-left"
                  >
                    {result.title}
                  </button>
                  <p className="text-gray-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: result.snippet + '...' }} />
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-gray-500">No results found for "{query}".</p>
              )}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (view === AppView.ARTICLE) {
    return (
      <Layout>
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goHome} className="text-2xl font-bold tracking-tighter text-gray-800 mr-4">
              Wiki<span className="text-blue-600">Insight</span>
            </button>
            <div className="hidden sm:block">
              <SearchInput initialValue={query} onSearch={handleSearch} className="w-64 md:w-96" />
            </div>
          </div>
          <button 
            onClick={() => setView(AppView.RESULTS)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            &larr; Back to results
          </button>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : article ? (
              <article>
                <h1 className="text-4xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">{article.title}</h1>
                <div className="wiki-content prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
              </article>
            ) : null}
          </div>

          {/* AI Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                  </svg>
                  <h3 className="font-bold text-blue-900 uppercase tracking-wider text-xs">AI Research Insights</h3>
                </div>

                {aiLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-blue-100 rounded animate-pulse"></div>
                    <div className="h-20 bg-blue-100 rounded animate-pulse"></div>
                    <div className="h-4 bg-blue-100 rounded animate-pulse"></div>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-4">
                    <section>
                      <h4 className="text-xs font-semibold text-blue-800 uppercase mb-1">Quick TL;DR</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{aiSummary.tldr}</p>
                    </section>
                    
                    <section>
                      <h4 className="text-xs font-semibold text-blue-800 uppercase mb-1">Key Takeaways</h4>
                      <ul className="list-disc ml-4 space-y-1">
                        {aiSummary.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-xs font-semibold text-blue-800 uppercase mb-1">Context</h4>
                      <p className="text-gray-700 text-sm italic">{aiSummary.context}</p>
                    </section>

                    <div className="pt-4 border-t border-blue-200">
                      <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                        <span className="block text-xs font-bold text-blue-600 mb-1">Did you know?</span>
                        <p className="text-xs text-gray-600 italic">"{aiSummary.funFact}"</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-blue-600 opacity-70 italic">Enhancing your reading with AI...</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Related Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                    Cite this article
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                    Download PDF
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                    View history
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Layout>
    );
  }

  return null;
};

export default App;
