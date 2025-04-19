import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Eye, Tags } from 'lucide-react';
import { db } from '../../lib/firebase';
import RichTextEditor from '../RichTextEditor';

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

interface FirestoreNewsArticle {
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  tags: string[];
  created_at: string;
  updated_at: string;
  image?: string;
}

export function NewsManager() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setError(null);
      const articlesQuery = db.query(
        db.collection('news_articles'),
        db.orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await db.getDocs(articlesQuery);
      const fetchedArticles = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreNewsArticle;
        return {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          author: data.author || '',
          status: data.status || 'draft',
          tags: data.tags || [],
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          image: data.image || ''
        };
      });
      
      setArticles(fetchedArticles);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching articles';
      console.error('Error fetching articles:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    try {
      const articleData = {
        title: editingArticle.title,
        content: editingArticle.content,
        author: editingArticle.author,
        status: editingArticle.status,
        tags: editingArticle.tags,
        updated_at: new Date().toISOString(),
        image: editingArticle.image || ''
      };

      if (editingArticle.id) {
        // Update existing article
        await db.updateDoc(db.doc(db, 'news_articles', editingArticle.id), articleData);
      } else {
        // Create new article
        await db.addDoc(db.collection('news_articles'), {
          ...articleData,
          created_at: new Date().toISOString()
        });
      }

      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const docRef = db.doc(db, 'news_articles', id);
      await db.deleteDoc(docRef);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'publish' | 'unpublish') => {
    if (!selectedArticles.length) return;

    try {
      switch (action) {
        case 'delete':
          for (const id of selectedArticles) {
            const docRef = db.doc(db, 'news_articles', id);
            await db.deleteDoc(docRef);
          }
          break;

        case 'publish':
        case 'unpublish':
          for (const id of selectedArticles) {
            const docRef = db.doc(db, 'news_articles', id);
            await db.updateDoc(docRef, {
              status: action === 'publish' ? 'published' : 'draft',
              updated_at: new Date().toISOString()
            });
          }
          break;
      }

      setSelectedArticles([]);
      fetchArticles();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News Articles</h2>
        <button
          onClick={() => setEditingArticle({
            id: '',
            title: '',
            content: '',
            author: '',
            status: 'draft',
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchArticles}
            className="mt-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
          <span>{selectedArticles.length} articles selected</span>
          <div className="space-x-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
            >
              Unpublish
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        {articles.map(article => (
          <div key={article.id} className="bg-accent rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedArticles.includes(article.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedArticles([...selectedArticles, article.id]);
                    } else {
                      setSelectedArticles(selectedArticles.filter(id => id !== article.id));
                    }
                  }}
                  className="bg-background rounded"
                />
                <div>
                  <h3 className="font-bold">{article.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{article.status}</span>
                    <span>•</span>
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPreviewContent(article.content);
                    setShowPreview(true);
                  }}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingArticle(article)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-accent rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingArticle.id ? 'Edit Article' : 'New Article'}
                </h3>
                <button
                  onClick={() => setEditingArticle(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      title: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <RichTextEditor
                    content={editingArticle.content}
                    onChange={(content) => setEditingArticle({
                      ...editingArticle,
                      content
                    })}
                    onPreview={() => {
                      setPreviewContent(editingArticle.content);
                      setShowPreview(true);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                  <input
                    type="text"
                    value={editingArticle.image || ''}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      image: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    placeholder="https://example.com/image.jpg"
                  />
                  {editingArticle.image && (
                    <div className="mt-2">
                      <img 
                        src={editingArticle.image} 
                        alt="Article preview" 
                        className="max-h-40 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Tags className="h-4 w-4 inline mr-1" />
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingArticle.tags.join(', ')}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      tags: e.target.value.split(',').map(tag => tag.trim())
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    placeholder="technology, news, updates"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={editingArticle.author}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      author: e.target.value
                    })}
                    className="w-full bg-background px-4 py-2 rounded"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={editingArticle.status === 'published'}
                    onChange={(e) => setEditingArticle({
                      ...editingArticle,
                      status: e.target.checked ? 'published' : 'draft'
                    })}
                    className="bg-background rounded"
                  />
                  <label htmlFor="status" className="text-sm">Published</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors"
                >
                  Save Article
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-accent rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
