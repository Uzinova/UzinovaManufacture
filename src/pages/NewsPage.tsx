import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Search } from 'lucide-react';
import { LoadingScreen } from '../components/LoadingScreen';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { NewsArticle, NewsCategory } from '../types/news';

export default function NewsPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      const articlesQuery = query(
        collection(db, 'news_articles'),
        orderBy('published_at', 'desc')
      );
      
      const querySnapshot = await getDocs(articlesQuery);
      const fetchedArticles = querySnapshot.docs
        .filter(doc => doc.data().status === 'published')
        .map(doc => ({
          id: doc.id,
          ...doc.data() as NewsArticle
        }));
      
      setArticles(fetchedArticles);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = query(
        collection(db, 'news_categories'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(categoriesQuery);
      const fetchedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as NewsCategory
      }));
      
      setCategories(fetchedCategories);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching categories:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error fetching categories:', error);
      }
      // Set empty categories array to prevent UI from breaking
      setCategories([]);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.news_categories?.name === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <LoadingScreen message="Loading news articles..." />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-accent/95 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Geri
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Haberler</h1>
            <p className="text-gray-400">En son gelişmeler ve güncellemeler</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center bg-accent rounded-lg p-2">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Haberlerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                Tüm Haberler
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent hover:bg-accent/80'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="bg-accent rounded-lg overflow-hidden hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] transition-all duration-300"
              >
                {article.featured_image && (
                  <div className="aspect-video">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(article.published_at || '').toLocaleDateString('tr-TR')}
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {article.tags[0]}
                        {article.tags.length > 1 && ` +${article.tags.length - 1}`}
                      </div>
                    )}
                  </div>
                  <div 
                    className="text-gray-400 text-sm mb-4 line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                    }}
                  />
                  <span className="text-primary hover:text-primary/80 transition-colors">
                    Devamını Oku
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
