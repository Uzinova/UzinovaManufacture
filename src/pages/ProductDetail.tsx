import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, Package } from 'lucide-react';
import { LoadingScreen } from '../components/LoadingScreen';
import { db } from '../lib/firebase';
import { useCart } from '../contexts/CartContext';
import { Navbar } from '../components/Navbar';
import { useNotification } from '../contexts/NotificationContext';

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
  featured: boolean;
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const productQuery = db.query(
          db.collection('products'),
          db.where('__name__', '==', id)
        );
        
        const querySnapshot = await db.getDocs(productQuery);
        
        if (querySnapshot.docs.length === 0) {
          console.log("No product found with ID:", id);
          setLoading(false);
          return; // Product not found
        }
        
        // Get the first (and should be only) document
        const productDoc = querySnapshot.docs[0];
        const productData = productDoc.data() as {
          name: string;
          price: number;
          description: string;
          category: string;
          categoryPath: string[];
          images: string[];
          mainImageIndex: number;
          stock: number;
          featured: boolean;
        };
        
        setProduct({ 
          id: productDoc.id, 
          ...productData 
        });
        
        console.log("Product loaded successfully:", productDoc.id);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value: number) => {
    if (product && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMousePosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[product.mainImageIndex || 0] : '',
      quantity: quantity
    });
    
    // Show toast notification
    showNotification('cart', `${product.name} sepete eklendi!`);
  };

  if (loading) {
    return (
      <LoadingScreen message="Loading product details..." />
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Ürün bulunamadı</h2>
        <button
          onClick={() => navigate('/products')}
          className="text-primary hover:text-primary/80 transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Ürünlere Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Navigation */}
        <button
          onClick={() => navigate('/products')}
          className="text-primary hover:text-primary/80 transition-colors flex items-center mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Ürünlere Dön
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div 
              ref={imageRef}
              className="relative aspect-square rounded-lg overflow-hidden bg-accent cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex >= 0 && selectedImageIndex < product.images.length ? selectedImageIndex : 0]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : ''
                  }`}
                  style={isZoomed ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                  } : undefined}
                />
              ) : (
                <div className="w-full h-full bg-accent flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-5 gap-2">
              {product.images && Array.isArray(product.images) ? product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden bg-accent ${
                    selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Görsel ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              )) : null}
            </div>
            
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              %20 İndirim
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.categoryPath && (
                <p className="text-primary text-sm">
                  {product.categoryPath.join(" > ")}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
              
              </div>
             </div>

            <div className="space-y-2">
              <div className="flex items-center">
               
                <span className="text-3xl font-bold text-primary ml-4">
                  {Math.round(product.price )} ₺
                </span>
              </div>
              <p className="text-sm text-gray-400">
                KDV Dahil | Ücretsiz Kargo
              </p>
            </div>

            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: product.description 
              }} 
            />

            <div className="space-y-4 py-6 border-y border-accent">
              <div className="flex items-center space-x-4">
                <div className="bg-accent p-3 rounded-full">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Hızlı Teslimat</h3>
                  <p className="text-sm text-gray-400">2-4 iş günü içinde kargo</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-accent p-3 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Güvenli Alışveriş</h3>
                  <p className="text-sm text-gray-400">256-bit SSL güvenlik</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-accent p-3 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Kolay İade</h3>
                  <p className="text-sm text-gray-400">30 gün içinde ücretsiz iade</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-accent rounded-lg">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-4 py-2 text-lg hover:text-primary transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  className="w-16 text-center bg-transparent border-x border-accent"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-4 py-2 text-lg hover:text-primary transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button 
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Sepete Ekle
              </button>
            </div>

            <p className="text-sm text-gray-400">
              Stok Durumu: <span className="text-primary">{product.stock} adet</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
