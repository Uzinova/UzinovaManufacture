import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingScreen } from '../components/LoadingScreen';
import { db } from '../lib/firebase';
import { ProductCard } from '../components/ProductCard';
import { Navbar } from '../components/Navbar';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import type { ProductLabel } from '../types/product';

// Define a more specific type for Firestore document data
interface FirestoreData {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  subcategory?: string;
  categoryPath?: string[];
  images?: string[];
  mainImageIndex?: number;
  stock?: number;
  labels?: string[];
  subcategories?: string[];
  path?: string[];
  color?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  subcategory?: string;
  categoryPath?: string[];
  images: string[];
  mainImageIndex: number;
  stock: number;
  labels?: string[];
}

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  path?: string[];
}

function ProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<ProductLabel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLabels();
  }, []);

  useEffect(() => {
    // Update filters when URL changes
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    }
    
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const fetchLabels = async () => {
    try {
      const labelsQuery = db.query(
        db.collection('product_labels')
      );
      
      const querySnapshot = await db.getDocs(labelsQuery);
      const fetchedLabels = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreData;
        return {
          id: doc.id,
          ...data
        } as ProductLabel;
      });
      
      setLabels(fetchedLabels);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsQuery = db.query(
        db.collection('products')
      );
      
      const querySnapshot = await db.getDocs(productsQuery);
      const fetchedProducts = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreData;
        return {
          id: doc.id,
          ...data
        } as Product;
      });
      
      console.log('Fetched products:', fetchedProducts);
      setProducts(fetchedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = db.query(
        db.collection('categories')
      );
      
      const querySnapshot = await db.getDocs(categoriesQuery);
      const fetchedCategories = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreData;
        return {
          id: doc.id,
          name: data.name || '',
          subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
          path: Array.isArray(data.path) ? data.path : [data.name]
        } as Category;
      });
      
      console.log('Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
                         product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category and subcategory
    let matchesCategory = true;
    
    if (selectedCategory) {
      // First check: Match by direct category/subcategory fields
      if (selectedSubcategory) {
        // Both category and subcategory must match
        matchesCategory = (product.category === selectedCategory && 
                          product.subcategory === selectedSubcategory);
      } else {
        // Just category needs to match
        matchesCategory = product.category === selectedCategory;
      }
      
      // Second check: Match using categoryPath if the first check failed
      if (!matchesCategory && product.categoryPath && product.categoryPath.length > 0) {
        if (selectedSubcategory) {
          // Both category and subcategory must be in the path
          matchesCategory = product.categoryPath.includes(selectedCategory) && 
                           product.categoryPath.includes(selectedSubcategory);
        } else {
          // Just category needs to be in the path
          matchesCategory = product.categoryPath.includes(selectedCategory);
        }
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[product.mainImageIndex || 0] : '',
        quantity: 1
      });
      
      // Show toast notification
      showNotification('cart', `${product.name} sepete eklendi!`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleCategorySelect = (category: Category | null) => {
    if (category) {
      setSelectedCategory(category.name);
      setSelectedSubcategory(null);
      
      // Update URL with category parameter
      const params = new URLSearchParams(searchParams);
      params.set('category', category.name);
      params.delete('subcategory');
      navigate(`?${params.toString()}`, { replace: true });
    } else {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      
      // Remove category and subcategory from URL
      const params = new URLSearchParams(searchParams);
      params.delete('category');
      params.delete('subcategory');
      navigate(`?${params.toString()}`, { replace: true });
    }
  };

  // Main categories are the ones with path length 1 or no path
  const mainCategories = categories.filter(cat => !cat.path || cat.path.length === 1);

  if (loading) {
    return (
      <LoadingScreen message="Loading products..." />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center bg-accent rounded-lg p-2">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent flex-1 outline-none"
              />
            </div>
            
            {/* Category filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Filter className="h-5 w-5 text-primary flex-shrink-0" />
              
              {/* All Products button */}
              <button
                onClick={() => handleCategorySelect(null)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                Tüm Ürünler
              </button>
              
              {/* Category buttons */}
              {mainCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
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

            {/* Subcategory filters - show only when a category is selected */}
            {selectedCategory && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 pl-6">
                <button
                  onClick={() => {
                    setSelectedSubcategory(null);
                    const params = new URLSearchParams(searchParams);
                    params.delete('subcategory');
                    navigate(`?${params.toString()}`, { replace: true });
                  }}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    !selectedSubcategory
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/70 hover:bg-accent'
                  }`}
                >
                  Hepsi
                </button>
                
                {categories
                  .find(cat => cat.name === selectedCategory)
                  ?.subcategories.map((subcat, index) => (
                    <button
                      key={`${selectedCategory}-${index}`}
                      onClick={() => {
                        setSelectedSubcategory(subcat);
                        const params = new URLSearchParams(searchParams);
                        params.set('subcategory', subcat);
                        navigate(`?${params.toString()}`, { replace: true });
                      }}
                      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                        selectedSubcategory === subcat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent/70 hover:bg-accent'
                      }`}
                    >
                      {subcat}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Product Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {filteredProducts.length} ürün bulundu
              {selectedCategory ? ` "${selectedCategory}" kategorisinde` : ''}
              {selectedSubcategory ? ` ve "${selectedSubcategory}" alt kategorisinde` : ''}
              {searchQuery ? ` "${searchQuery}" araması için` : ''}
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                {...product}
                allLabels={labels}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          
          {/* No Products Found */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500">Ürün bulunamadı</p>
              <p className="text-gray-400 mt-2">Farklı bir kategori seçin veya arama terimini değiştirin</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProductPage;
