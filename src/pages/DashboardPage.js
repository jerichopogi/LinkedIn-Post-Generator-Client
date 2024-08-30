import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';

const DEFAULT_OPENAI_CONTEXT = "articles relevant to executives at C-level and VP of healthcare organizations such as Health Plans, Hospitals, Healthcare Vendors, Clearinghouses";

const DashboardPage = () => {
  const { user } = useAuth();
  const [rssFeeds, setRssFeeds] = useState([]);
  const [newFeed, setNewFeed] = useState('');
  const [openAIContext, setOpenAIContext] = useState(DEFAULT_OPENAI_CONTEXT); // Set default context
  const [posts, setPosts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [topArticles, setTopArticles] = useState('');
  const [linkedinPosts, setLinkedinPosts] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const checkScanStatus = async () => {
      try {
        const response = await fetch('https://linked-in-post-generator-server.vercel.app/check-scan');
        const data = await response.json();
        if (!data.scanDone) {
          setScanning(true);
          await handleFetchArticles();
        }
        setLoading(false);
      } catch (err) {
        console.error('Error checking scan status:', err);
        setError('Error checking scan status.');
        setLoading(false);
      }
    };

    checkScanStatus();
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    const { data, error } = await supabase.from('rss_feeds').select('*');
    if (error) console.error('Error fetching RSS feeds:', error);
    else setRssFeeds(data);
  };

  const handleAddFeed = async () => {
    setError('');
    setIsValidating(true);
    setValidationStatus(null);

    try {
      const response = await fetch('https://linked-in-post-generator-server.vercel.app/validate-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newFeed }),
      });

      if (!response.ok) {
        setValidationStatus('invalid');
        throw new Error('Invalid RSS feed format');
      }

      const { error } = await supabase.from('rss_feeds').insert([{ url: newFeed }]);
      if (error) {
        console.error('Error adding feed:', error);
        setError('Error adding feed. Please try again.');
        setValidationStatus('invalid');
      } else {
        setNewFeed('');
        fetchFeeds();
        setValidationStatus('valid');
      }
    } catch (err) {
      console.error('Error adding feed:', err);
      setError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteFeed = async (id) => {
    const { error } = await supabase.from('rss_feeds').delete().eq('id', id);
    if (error) console.error('Error deleting feed:', error);
    else fetchFeeds();
  };

  const handleFetchArticles = async () => {
    if (rssFeeds.length === 0) {
      setError('No RSS feeds available to fetch articles.');
      setScanning(false);
      return;
    }
  
    setError('');
    setScanning(true);
  
    try {
      const feedUrls = rssFeeds.map(feed => feed.url);
      console.log('Fetching articles with feed URLs:', feedUrls); // Debug log
      console.log('Using OpenAI context:', openAIContext); // Debug log
  
      const response = await fetch('https://linked-in-post-generator-server.vercel.app/fetch-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feeds: feedUrls, openAiContext: openAIContext }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch articles.');
      }
  
      const { articles, topArticles, linkedinPosts } = await response.json();
      console.log('Fetched articles:', articles); // Debug log
      console.log('Top articles:', topArticles); // Debug log
      console.log('LinkedIn posts:', linkedinPosts); // Debug log
  
      setArticles(articles);
      setTopArticles(topArticles);
      setLinkedinPosts(linkedinPosts);
      setScanning(false);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
      setScanning(false);
    }
  };

  const handleSaveContext = async () => {
    const { error } = await supabase.from('openai_context').upsert({ context: openAIContext });
    if (error) console.error('Error saving OpenAI context:', error);
  };

  const handleCopyPost = (text) => {
    navigator.clipboard.writeText(text);
    alert('Post copied to clipboard!');
  };

  const handleRefreshPosts = async () => {
    try {
      refetchPosts();
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  // Fetch LinkedIn-ready posts from Supabase using React Query
  const { data: fetchedPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['fetchPosts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => setPosts(data),
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-center text-white text-xl font-semibold">Loading articles for today...</h2>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Manage RSS Feeds</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  value={newFeed}
                  onChange={(e) => setNewFeed(e.target.value)}
                  placeholder="Enter RSS feed URL"
                  className="flex-grow p-3 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddFeed}
                  className={`bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded transition-colors ${isValidating ? 'cursor-wait' : ''}`}
                  disabled={isValidating}
                >
                  {isValidating ? 'Validating...' : 'Add Feed'}
                </button>
                {validationStatus === 'valid' && <span className="text-green-500 ml-2">✓</span>}
                {validationStatus === 'invalid' && <span className="text-red-500 ml-2">✗</span>}
              </div>
              <ul className="space-y-2">
                {rssFeeds.map((feed) => (
                  <li key={feed.id} className="flex justify-between items-center bg-gray-800 p-4 rounded">
                    <span>{feed.url}</span>
                    <button
                      onClick={() => handleDeleteFeed(feed.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">OpenAI Context Configuration</h2>
              <textarea
                value={openAIContext}
                onChange={(e) => setOpenAIContext(e.target.value)}
                placeholder={DEFAULT_OPENAI_CONTEXT}
                className="w-full p-3 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <button
                onClick={handleSaveContext}
                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded transition-colors"
              >
                Save Context
              </button>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">LinkedIn-ready Posts</h2>
              <button
                onClick={handleRefreshPosts}
                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded mb-4 transition-colors"
              >
                Refresh Posts
              </button>
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li key={post.id} className="bg-gray-800 p-4 rounded">
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p className="text-gray-400">{post.excerpt}</p>
                    <p className="text-gray-500"><strong>Tags:</strong> {post.tags.join(', ')}</p>
                    <a
                      href={post.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      Original Article
                    </a>
                    <button
                      onClick={() => handleCopyPost(post.text)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded mt-2 transition-colors"
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {articles.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Today's Articles</h2>
                <ul className="space-y-4">
                  {articles.map((article) => (
                    <li key={article.id} className="bg-gray-800 p-4 rounded">
                      <h3 className="text-xl font-bold">{article.title}</h3>
                      <p className="text-gray-400">{article.content}</p>
                      <p className="text-gray-500"><strong>Published on:</strong> {new Date(article.pubDate).toLocaleDateString()}</p>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Read more
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {topArticles && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Top Articles Recommended by OpenAI</h2>
                <p className="text-gray-400">{topArticles}</p>
              </section>
            )}

            {linkedinPosts && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Generated LinkedIn Posts</h2>
                <pre className="bg-gray-800 p-4 rounded text-white whitespace-pre-wrap">{linkedinPosts}</pre>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;