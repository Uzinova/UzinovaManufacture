import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Rocket, Printer as Printer3D, Radio      , Satellite, Download, Upload, Wifi, Settings, Activity, X, Timer, Percent, Calendar, ArrowRight } from 'lucide-react';
import { Link, Routes, Route } from 'react-router-dom';
import { db } from './lib/firebase';
import { ProductCard } from './components/ProductCard';
import { Navbar } from './components/Navbar';
import type { ProductLabel } from './types/product';
import { useCart } from './contexts/CartContext';
import { useNotification } from './contexts/NotificationContext';
import { useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import NewsDetail from './pages/NewsDetail';
import './styles/Button17.css';
import './styles/StarButton.css';
import './styles/carousel.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
 

function App() {
  const [showGroundStation, setShowGroundStation] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [labels, setLabels] = useState<ProductLabel[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const seqref = useRef<HTMLCanvasElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{x: number; y: number; vx: number; vy: number}>>([]);
  const mouseRef = useRef<{x: number; y: number}>({ x: 0, y: 0 });
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { scrollYProgress } = useScroll({
    target: seqref,
    offset: ["start end", "end start"]
  });
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
 
  const seqimages = useMemo( () => {
    const loadimages:HTMLImageElement[] = [];
    let loadedCount = 0;
    const totalImages = 80;

    for(let i = 1; i <= totalImages; i++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Try multiple possible paths for the image
      const imagePaths = [
        `/seqimg/${String(i).padStart(4, '0')}.webp`,  // Production path
        `./seqimg/${String(i).padStart(4, '0')}.webp`,  // Relative path
        `/public/seqimg/${String(i).padStart(4, '0')}.webp`,  // Public path
      ];

      let currentPathIndex = 0;
      
      const tryNextPath = () => {
        if (currentPathIndex < imagePaths.length) {
          const path = imagePaths[currentPathIndex];
          console.log(`Trying to load image ${i} from path: ${path}`);
          img.src = path;
          currentPathIndex++;
        } else {
          // If all paths failed, use fallback
          console.error(`All paths failed for image ${i}`);
          const fallbackImg = new Image();
          fallbackImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          loadimages.push(fallbackImg);
          loadedCount++;
          if (loadedCount === totalImages) {
            setLoadedImages(loadimages);
          }
        }
      };

      img.onload = () => {
         loadimages.push(img);
        loadedCount++;
        if (loadedCount === totalImages) {
          setLoadedImages(loadimages);
        }
      };
      
      img.onerror = (error) => {
        console.error(`Error loading image ${i} from path: ${img.src}`, error);
        tryNextPath();
      };
      
      // Start with the first path
      tryNextPath();
    }
    return loadimages;
  }, []);

  const currentIndex = useTransform(scrollYProgress, [0, 0.6], [1, 80]);
  const yTransform = useTransform(scrollYProgress, [0, 0.6], [0, -50]);

  const renderSeq = useCallback((index: number) => {
    const ctx = seqref.current?.getContext('2d');
    if (!ctx) return;
    
    const canvas = seqref.current;
    if (!canvas) return;

    // Only update canvas size if it has changed
    if (canvas.width !== 1920 || canvas.height !== 1080) {
      canvas.width = 1920;
      canvas.height = 1080;
    }
    
    try {
      // Use requestAnimationFrame for smooth rendering
      requestAnimationFrame(() => {
        if (!ctx) return;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Check if we have a valid image at this index
        const image = loadedImages[index - 1];
        if (!image || image.complete === false) {
          // Draw a placeholder if image is not ready
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return;
        }
        
        try {
          // Draw the image
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        } catch (drawError) {
          console.error('Error drawing image:', drawError);
          // Draw a placeholder on draw error
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      });
    } catch (error) {
      console.error('Error in renderSeq:', error);
      // Clear the canvas on error
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [loadedImages]);

  // Debounce scroll handling for better performance
  useEffect(() => {
    let rafId: number;
    let lastScrollTime = 0;
    const scrollThrottle = 1000 / 60; // 60fps

    const handleScroll = () => {
      const currentTime = Date.now();
      if (currentTime - lastScrollTime < scrollThrottle) return;
      
      lastScrollTime = currentTime;
      const sequenceSection = document.getElementById('sequence-section');
      if (!sequenceSection) return;
      
      const rect = sequenceSection.getBoundingClientRect();
      const progress = -rect.top / (sequenceSection.offsetHeight - window.innerHeight);
      
      if (progress >= 0 && progress <= 1) {
        const frameIndex = Math.max(1, Math.min(80, Math.floor(progress * 80)));
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => renderSeq(frameIndex));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [renderSeq]);

  useMotionValueEvent(currentIndex, 'change', (latest) => {
    const frameIndex = Math.max(1, Math.min(80, Math.round(latest)));
    renderSeq(frameIndex);
  });

  const fetchNews = useCallback(async () => {
    try {
      const newsQuery = db.query(
        db.collection('news_articles'),
        db.where('status', '==', 'published')
      );
      
      const querySnapshot = await db.getDocs(newsQuery);
      const fetchedNews = querySnapshot.docs
        .filter(doc => doc.data().status === 'published')
        .sort((a, b) => new Date(b.data().created_at).getTime() - new Date(a.data().created_at).getTime())
        .slice(0, 3)
        .map(doc => {
          const data = doc.data() as {
            title: string;
            content: string;
            image?: string;
            created_at: string;
            status: string;
          };
          
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            image: data.image,
            date: new Date(data.created_at).toLocaleDateString('tr-TR'),
            summary: data.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
          };
        });
      
      setNews(fetchedNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }, []);

  useEffect(() => {
    // Subscribe to hero slides changes
    const fetchHeroSlides = async () => {
      try {
        const slidesQuery = db.query(
          db.collection('hero_slides'),
          db.orderBy('display_order', 'asc')
        );
        
        const querySnapshot = await db.getDocs(slidesQuery);
        const slides = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(slide => slide.is_active);
        
        setHeroSlides(slides);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      }
    };

    fetchHeroSlides();
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const labelsQuery = db.query(
          db.collection('product_labels')
        );
        
        const labelsSnapshot = await db.getDocs(labelsQuery);
        const fetchedLabels = labelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProductLabel[];
        
        setLabels(fetchedLabels);

        const productsQuery = db.query(
          db.collection('products'),
          db.where('featured', '==', true)
        );
        
        const querySnapshot = await db.getDocs(productsQuery);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(product => product.featured);
        
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    
    fetchFeaturedProducts();
    fetchNews();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      }));
    };
    initParticles();

    // Animation loop
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-reveal, .product-card, .feature-card, .stagger-animate, .fade-in, .scale-in, .news-card');
      
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        if (isVisible) {
          element.classList.add('visible');
        }
      });
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    window.addEventListener('resize', resizeCanvas);

    // Initial check for visible elements
    setTimeout(handleScroll, 100);

    // Auto-scroll for featured products
    const featuredInterval = setInterval(() => {
      const maxIndex = Math.max(0, featuredProducts.length - 4);
      setCurrentImageIndex((prev) => (prev + 1) % (maxIndex + 1));
    }, 3000);

    // Image Rotation
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % (heroSlides.length || 1));
    }, 1000);

    // Show promo popup after 3 seconds
    const promoTimeout = setTimeout(() => {
      setShowPromo(true);
    }, 1000);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(imageInterval);
      clearInterval(featuredInterval);
      clearTimeout(promoTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [featuredProducts.length]);

  const handleAddToCart = (id: string) => {
    const product = featuredProducts.find(p => p.id === id);
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

  // Add scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Add useEffect for auto-scrolling
  useEffect(() => {
    if (!autoScroll || featuredProducts.length === 0) return;

    const maxIndex = Math.ceil(featuredProducts.length / 4) - 1;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const next = prev + 1;
        return next > maxIndex ? 0 : next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoScroll, featuredProducts.length]);

  return (
    <Routes>
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/" element={
        <div className="min-h-screen bg-background text-foreground relative">
          {/* Navigation */}
          <Navbar transparent={false} />
          <div className="flex items-center space-x-4">
            <Link to="/kompozit" className="text-white hover:text-primary transition-colors">
              Kompozit Üretim
            </Link>
            <Link to="/3d-model" className="text-white hover:text-primary transition-colors">
              3D Model
            </Link>
            <Link to="/products" className="text-white hover:text-primary transition-colors">
              Roket Ekipmanları
            </Link>
          </div>
         {/* Hero Section */}
         <div style={{ }} className="relative h-screen  ">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {slide.title && (
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div className="max-w-4xl px-4">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-xl md:text-2xl mb-8 text-white/90">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.cta_text && slide.cta_url && (
                        <Link
                          to={slide.cta_url}
                          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md text-lg hover:bg-primary/90 transition-colors transform hover:scale-105"
                        >
                          {slide.cta_text}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="hero-overlay" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center fade-in visible">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 glow-effect">
                  Model Roketçilikte Yeni Nesil
                </h1>
                <p className="text-xl md:text-2xl mb-8">
                  Profesyonel model roket ve sonda roket çözümleri
                </p>
                <Link to="/products" className="star-button inline-block">
                  <svg className="star-1" width="50" height="50" viewBox="0 0 512 512">
                    <path className="fil0" d="M512 198.525l-176.89-25.704-79.11-160.291-79.108 160.291-176.892 25.704 128 124.769-30.216 176.176 158.216-83.179 158.216 83.179-30.217-176.176 128.001-124.769z"/>
                  </svg>
                  <svg className="star-2" width="50" height="50" viewBox="0 0 512 512">
                    <path className="fil0" d="M512 198.525l-176.89-25.704-79.11-160.291-79.108 160.291-176.892 25.704 128 124.769-30.216 176.176 158.216-83.179 158.216 83.179-30.217-176.176 128.001-124.769z"/>
                  </svg>
                  <svg className="star-3" width="50" height="50" viewBox="0 0 512 512">
                    <path className="fil0" d="M512 198.525l-176.89-25.704-79.11-160.291-79.108 160.291-176.892 25.704 128 124.769-30.216 176.176 158.216-83.179 158.216 83.179-30.217-176.176 128.001-124.769z"/>
                  </svg>
                  <svg className="star-4" width="50" height="50" viewBox="0 0 512 512">
                    <path className="fil0" d="M512 198.525l-176.89-25.704-79.11-160.291-79.108 160.291-176.892 25.704 128 124.769-30.216 176.176 158.216-83.179 158.216 83.179-30.217-176.176 128.001-124.769z"/>
                  </svg>
                  <svg className="star-5" width="50" height="50" viewBox="0 0 512 512">
                    <path className="fil0" d="M512 198.525l-176.89-25.704-79.11-160.291-79.108 160.291-176.892 25.704 128 124.769-30.216 176.176 158.216-83.179 158.216 83.179-30.217-176.176 128.001-124.769z"/>
                  </svg>
                  <svg className="star-6" width="50" height="50" viewBox="0 0 512 512">
                    <path className="fil0" d="M512 198.525l-176.89-25.704-79.11-160.291-79.108 160.291-176.892 25.704 128 124.769-30.216 176.176 158.216-83.179 158.216 83.179-30.217-176.176 128.001-124.769z"/>
                  </svg>
                  Keşfetmeye Başla
                </Link>
              </div>
            </div>
            
            {/* Image Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-primary' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Featured Products Section */}
          <div className="bg-background py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-accent/0 to-accent/10" />
            <div className="interactive-bg" />
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 scroll-reveal">Öne Çıkan Ürünler</h2>
              
              {/* Carousel Container */}
              <Carousel
                additionalTransfrom={0}
                arrows
                autoPlay
                autoPlaySpeed={3000}
                centerMode={false}
                className=""
                containerClass="carousel-container"
                dotListClass=""
                draggable
                focusOnSelect={false}
                infinite
                itemClass=""
                keyBoardControl
                minimumTouchDrag={80}
                pauseOnHover={false}
                renderArrowsWhenDisabled={false}
                renderButtonGroupOutside={false}
                renderDotsOutside={false}
                responsive={{
                  desktop: {
                    breakpoint: {
                      max: 3000,
                      min: 1024
                    },
                    items: 6,
                    partialVisibilityGutter: 20
                  },
                  tablet: {
                    breakpoint: {
                      max: 1024,
                      min: 464
                    },
                    items: 3,
                    partialVisibilityGutter: 20
                  },
                  mobile: {
                    breakpoint: {
                      max: 464,
                      min: 0
                    },
                    items: 2,
                    partialVisibilityGutter: 15
                  }
                }}
                rewind={false}
                rewindWithAnimation={false}
                rtl={false}
                shouldResetAutoplay
                showDots
                sliderClass=""
                slidesToSlide={2}
                swipeable
                customTransition="transform 500ms ease-in-out"
                ssr={false}
              >
                {featuredProducts.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="px-1">
                    <div className="bg-card rounded-lg overflow-hidden shadow-lg h-full transform transition-transform hover:scale-105">
                      <ProductCard
                        {...item}
                        allLabels={labels}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>

   
          {/* Sequance Images */}
         
         
        


          {/* Sequence Animation Section */}
          <div 
            id="sequence-section"
            className="sequence-section"
            style={{ 
              minHeight: '120vh',
              position: 'relative',
              background: '#000000',
              marginBottom: '-45vh',
              willChange: 'transform'
            }}
          >
            <div 
              className="sequence-container"
              style={{ 
                position: 'sticky',
                top: 0,
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                background: '#000000',
                willChange: 'transform'
              }}
            >
              <div 
                className="sequence-canvas-wrapper"
                style={{ 
                  width: '80%',
                  height: '80vh',
                  maxWidth: '600px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translateY(${yTransform.get()}%)`,
                  marginBottom: '5vh',
                  willChange: 'transform'
                }}
              >
                <canvas 
                  ref={seqref} 
                  className="sequence-canvas"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    imageRendering: 'auto',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
              </div>
            </div>
          </div>

          {/* Add CSS styles for responsive design */}
          <style>{`
            @media (min-width: 768px) {
              .sequence-canvas-wrapper {
                width: 40% !important;
                height: 70vh !important;
              }
            }
          `}</style>

       
    
          {/* Categories */}
          <div className="max-w-7xl mx-auto px-4 py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/0 to-background/10" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="feature-card hover:shadow-xl transition-all duration-300">
                <Rocket className="h-12 w-12 text-primary mb-4 floating" />
                <h3 className="text-xl font-bold mb-2">Kompozit Üretim</h3>
                <p className="text-gray-400">Yüksek performanslı roket bileşenleri ve güvenilir mühendislik</p>
              </div>
              <Link to="/services/3d-printing" className="feature-card hover:shadow-xl transition-all duration-300">
                <Printer3D className="h-12 w-12 text-primary mb-4 floating" />
                <h3 className="text-xl font-bold mb-2">3D Baskı Hizmeti</h3>
                <p className="text-gray-400">Havacılık sınıfı malzemelerle özel parça baskısı</p>
              </Link>
              <div className="feature-card hover:shadow-xl transition-all duration-300">
                <Radio className="h-12 w-12 text-primary mb-4 floating" />
                <h3 className="text-xl font-bold mb-2">Roket Ekipmanları</h3>
                <p className="text-gray-400">Profesyonel roket ekipmanları ve kontrol sistemleri</p>
              </div>
              <div className="feature-card hover:shadow-xl transition-all duration-300">
                <Satellite className="h-12 w-12 text-primary mb-4 floating" />
                <h3 className="text-xl font-bold mb-2">Yer İstasyonu</h3>
                <p className="text-gray-400">Gelişmiş telemetri ve kontrol yazılımları</p>
              </div>
            </div>
          </div>

     {/* Ground Station Section */}
     <div id="yeristasyonu" className="bg-accent py-16 relative scroll-reveal">
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/0 to-background/20" />
            <div className="interactive-bg" />
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Yer İstasyonu Yazılımı</h2>
                <p className="text-xl text-gray-400">Profesyonel roket takibi ve telemetri çözümleri</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-background p-8 rounded-lg pulse hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <Activity className="h-8 w-8 text-primary mr-4" />
                    <h3 className="text-2xl font-bold">Gerçek Zamanlı Yer İstasyonu</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <Download className="h-5 w-5 text-primary mr-3" />
                      <span>Anlık veri aktarımı ve kayıt</span>
                    </li>
                    <li className="flex items-center">
                      <Upload className="h-5 w-5 text-primary mr-3" />
                      <span>Komut gönderimi ve kontrol</span>
                    </li>
                    <li className="flex items-center">
                      <Wifi className="h-5 w-5 text-primary mr-3" />
                      <span>Güçlü sinyal işleme</span>
                    </li>
                    <li className="flex items-center">
                      <Settings className="h-5 w-5 text-primary mr-3" />
                      <span>Özelleştirilebilir arayüz</span>
                    </li>
                  </ul>
                </div>
                <div className="relative hover:shadow-xl transition-all duration-300">
                  <img 
                    src="https://resimyukle.app/i/6NDdpPrs.png"
                    alt="Yer İstasyonu"
                    className="rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                </div>
              </div>
            </div>
          </div>

        
       {/* News Section with Space Theme */}
       <div className="py-16 relative overflow-hidden bg-gradient-to-b from-background to-accent/20">
            {/* Space Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,146,60,0.05),_transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(251,146,60,0.05),_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(251,146,60,0.05),_transparent_50%)]" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-3xl font-bold scroll-reveal text-white">Son Gelişmeler</h2>
                </div>
                <Link to="/news" className="flex items-center text-primary hover:text-primary/80 transition-colors group">
                  Tüm Haberler
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.map((item, index) => (
                  <div key={index} className="news-card group relative h-[500px] overflow-hidden rounded-lg bg-black/40 hover:bg-black/50 backdrop-blur-sm border border-white/5 hover:border-primary/50 transition-all duration-300">
                    <div className="absolute inset-0">
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-primary/90 bg-primary/10 px-3 py-1.5 rounded-full">
                            <Calendar className="h-3.5 w-3.5" />
                            {item.date}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-primary/90 bg-primary/10 px-3 py-1.5 rounded-full">
                            <Rocket className="h-3.5 w-3.5" />
                            Uzay Teknolojileri
                          </div>
                        </div>
                        <Link 
                          to={`/news/${item.id}`}
                          className="block group/title"
                        >
                          <h3 className="text-xl font-bold mb-3 text-white group-hover/title:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-400 mb-4 line-clamp-3 text-sm">{item.summary}</p>
                        </Link>
                        <Link 
                          to={`/news/${item.id}`}
                          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium group/link"
                        >
                          Devamını Oku
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

     
          {/* Floating Rocket Button */}
          <button
            onClick={scrollToTop}
            className={`fixed bottom-8 left-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 ${
              showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`}
          >
            <Rocket className="h-6 w-6" />
          </button>

          {/* Footer */}
          <div className="relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <footer className="bg-accent py-12 relative z-10">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h4 className="font-bold mb-4">Hakkımızda</h4>
                    <p className="text-gray-400">
                      2019 yılındna biri bu sektörün öncüsü olan firmamız, model roketçilik ve uzay teknolojileri alanında hizmet vermektedir.  <br />
                      <a 
                        href="https://uzinova.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        uzinova.com
                      </a>
                    </p>
                     </div>
                  <div>
                    <h4 className="font-bold mb-4">Hızlı Bağlantılar</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><Link to="/products" className="hover:text-primary transition-colors">Mağaza</Link></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Hizmetler</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Destek</a></li>
                     
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4">İletişim</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>E-posta: iletisim@uzinovas.com</li>
                      <li>Telefon: (0212) 123 45 67</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4">Bülten</h4>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="E-posta adresiniz"
                        className="bg-background px-4 py-2 rounded-l"
                      />
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-r hover:bg-primary/90 transition-colors">
                        Abone Ol
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>



         
        </div>
      } />
    
    </Routes>
  );
}

export default App;
