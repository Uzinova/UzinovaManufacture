import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCNHAuNsVisApnZynx08hT6YVx_r6KniTQ",
  authDomain: "uzistore-ce655.firebaseapp.com",
  projectId: "uzistore-ce655",
  storageBucket: "uzistore-ce655.firebasestorage.app",
  messagingSenderId: "116096193726",
  appId: "1:116096193726:web:47eae91162c511e3413aef",
  measurementId: "G-WFZQQNVFLT"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  tags: string[];
  created_at: string;
  updated_at: string;
  image?: string;
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    if (!id) return;

    try {
      const docRef = doc(firestore, 'news_articles', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Haber bulunamadı');
        setIsLoading(false);
        return;
      }

      const data = docSnap.data();
      
      if (data.status !== 'published') {
        setError('Haber bulunamadı');
        setIsLoading(false);
        return;
      }

      setArticle({
        id: docSnap.id,
        title: data.title || '',
        content: data.content || '',
        author: data.author || '',
        status: data.status || 'draft',
        tags: data.tags || [],
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        image: data.image
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Haber yüklenirken bir hata oluştu');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar transparent={false} />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">{error || 'Haber bulunamadı'}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-primary/80 transition-colors flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20">
        <Navbar transparent={false} />
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto pt-32 pb-16">
          {article.image && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center space-x-4 text-gray-400 mb-8">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(article.created_at).toLocaleDateString('tr-TR')}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <Tag className="h-4 w-4" />
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-accent px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="mt-8 pt-8 border-t border-accent">
            <p className="text-gray-400">
              Yazar: {article.author}
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
