import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingScreen } from '../components/LoadingScreen';
import { db } from '../lib/firebase';
import { ProductCard } from '../components/ProductCard';
import { Navbar } from '../components/Navbar';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import type { ProductLabel } from '../types/product';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  categoryPath: string[];
  images: string[];
  mainImageIndex: number;
  stock: number;
  labels?: string[];
}

function ProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [labels, setLabels] = useState<ProductLabel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tüm Ürünler");
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
    // Update search query when URL changes
    const search = searchParams.get('search');
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const fetchLabels = async () => {
    try {
      const labelsQuery = db.query(
        db.collection('product_labels')
      );
      
      const querySnapshot = await db.getDocs(labelsQuery);
      const fetchedLabels = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductLabel[];
      
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
      const fetchedProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
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
      const fetchedCategories = querySnapshot.docs.map(doc => doc.data().name);
      
      setCategories(['Tüm Ürünler', ...fetchedCategories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "Tüm Ürünler" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Filter className="h-5 w-5 text-primary flex-shrink-0" />
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent hover:bg-accent/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
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
        </div>
      </main>
    </div>
  );
}

export default ProductPage;
