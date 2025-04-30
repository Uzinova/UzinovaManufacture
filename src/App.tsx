import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Rocket, Printer as Printer3D, Radio, Satellite, Download, Upload, Wifi, Settings, Activity, X, Timer, Percent, Calendar, ArrowRight, MessageCircle } from 'lucide-react';
import { Link, Routes, Route } from 'react-router-dom';
import { db } from './lib/firebase';
import { ProductCard } from './components/ProductCard';
import { Navbar } from './components/Navbar';
import type { ProductLabel } from './types/product';
import { useCart } from './contexts/CartContext';
import { useNotification } from './contexts/NotificationContext';
import { useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import NewsDetail from './pages/NewsDetail';
import GroundStation from './pages/GroundStation';
import Kompozit from './pages/Kompozit';
import ContactPage from './pages/ContactPage';
import './styles/Button17.css';
import './styles/StarButton.css';
import './styles/carousel.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import logo from './logo.png';
 

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
  const starfieldRef = useRef<HTMLCanvasElement>(null);
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
 
  // Add useEffect for starfield animation
  useEffect(() => {
    const starfield = starfieldRef.current;
    if (!starfield) return;
    const c = starfield.getContext('2d');
    if (!c) return;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    starfield.width = windowWidth;
    starfield.height = windowHeight;

    let stars: any[] = [];
    let initAnimation = true;
    let STARS_NUMBER = windowWidth / 4;
    const MIN_STAR_OPACITY = 4;
    const MAX_STAR_OPACITY = 10;

    function getStarsTypes(windowWidth: number, windowHeight: number) {
      return [
        {
          name: 'left',
          amount: 0.2,
          minSize: 2,
          maxSize: 2.5,
          minSpeed: 10,
          maxSpeed: 20,
          direction: -1,
          startX: -2 * windowWidth,
          startY: windowHeight/2,
          radius: 2 * windowWidth + 0.2 * windowWidth,
          startAngle: 70,
          endAngle: 110, 
        },
        {
          name: 'left-small',
          amount: 0.2,
          minSize: 1,
          maxSize: 2,
          minSpeed: 10,
          maxSpeed: 20,
          direction: -1,
          startX: -2 * windowWidth,
          startY: windowHeight/2,
          radius: 2 * windowWidth + 0.3 * windowWidth,
          startAngle: 70,
          endAngle: 110, 
        },
        {
          name: 'left-medium',
          amount: 0.2,
          minSize: 1,
          maxSize: 2,
          minSpeed: 10,
          maxSpeed: 20,
          direction: -1,
          startX: -windowWidth/2,
          startY: -2 * windowHeight,
          radius: 2 * windowHeight + 0.9 * windowHeight,
          startAngle: 340,
          endAngle: 60, 
        },
        {
          name: 'left-small',
          amount: 0.1,
          minSize: 1,
          maxSize: 2,
          minSpeed: 10,
          maxSpeed: 20,
          direction: -1,
          startX: -windowWidth/2 + windowWidth * 0.5,
          startY: -2 * windowHeight - windowHeight * 0.1,
          radius: 2 * windowHeight + 0.9 * windowHeight,
          startAngle: 340,
          endAngle: 60, 
        },
        {
          name: 'center-small',
          amount: 0.3,
          minSize: 0.5,
          maxSize: 1,
          minSpeed: 10,
          maxSpeed: 20,
          direction: -1,
          startX: windowWidth/2,
          startY: -2 * windowHeight,
          radius: 2 * windowHeight + 0.8 * windowHeight,
          startAngle: 340,
          endAngle: 30, 
        },
        {
          name: 'right-big',
          amount: 0.1,
          minSize: 1,
          maxSize: 3,
          minSpeed: 10,
          maxSpeed: 20,
          direction: 1,
          startX: 2 * windowWidth,
          startY: windowHeight/2,
          radius: 2 * windowWidth - 0.9 * windowWidth,
          startAngle: 290,
          endAngle: 230, 
        },
        {
          name: 'right-small',
          amount: 0.1,
          minSize: 1,
          maxSize: 2,
          minSpeed: 10,
          maxSpeed: 20,
          direction: 1,
          startX: 2 * windowWidth,
          startY: windowHeight/2,
          radius: 2 * windowWidth - 0.7 * windowWidth,
          startAngle: 290,
          endAngle: 230, 
        },
        {
          name: 'right-center',
          amount: 0.3,
          minSize: 1,
          maxSize: 2,
          minSpeed: 10,
          maxSpeed: 20,
          direction: 1,
          startX: 2 * windowWidth,
          startY: windowHeight/2,
          radius: 2 * windowWidth - 0.5 * windowWidth,
          startAngle: 290,
          endAngle: 230, 
        },
      ];
    }

    function Star(this: any, x: number, y: number, radius: number, speed: number, size: number, opacity: number, direction: number, startAngle: number, endAngle: number, maxSize: number, defaultStartAngle: number) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.startX = x;
      this.startY = y;
      this.speed = speed;
      this.size = size;
      this.defaultSize = size;
      this.opacity = opacity;
      this.age = 0;
      this.defaultOpacity = opacity;
      this.direction = -direction;
      this.startAngle = startAngle;
      this.endAngle = endAngle;
      this.angleReachZero = false;
      this.maxSize = maxSize;
      this.defaultStartAngle = defaultStartAngle;
      this.updateCalls = 0;
    }

    Star.prototype.update = function() {
      this.age += this.direction * this.speed;
      this.updateCalls += 1;

      let radAngle = (this.age * Math.PI + this.startAngle * Math.PI)/180 ;
      let sin = Math.sin(radAngle); 
      let cos = Math.cos(radAngle);
      
      this.x = this.radius * sin + this.startX;
      this.y = this.radius * cos + this.startY;
      
      if (this.direction > 0) {
        if (this.startAngle < this.endAngle) {
          if (getAngle(sin, cos) > this.endAngle) {
            this.age = 0;
            this.startAngle = this.defaultStartAngle;
            this.size = this.defaultSize;
          }
        } else {
          if (getAngle(sin, cos) < this.endAngle) {
            this.angleReachZero = true;
          }
          if (this.angleReachZero && getAngle(sin, cos) > this.endAngle) {
            this.age = 0;
            this.startAngle = this.defaultStartAngle;
            this.size = this.defaultSize;
            this.angleReachZero = false;
          } 
        }
      } else {
        if (this.startAngle > this.endAngle) {
          if (getAngle(sin, cos) < this.endAngle) {
            this.age = 0;
            this.startAngle = this.defaultStartAngle;
            this.size = this.defaultSize;
          }
        } else {
          if (getAngle(sin, cos) > this.endAngle) {
            this.angleReachZero = true;
          }
          if (this.angleReachZero && getAngle(sin, cos) < this.endAngle) {
            this.age = 0;
            this.startAngle = this.defaultStartAngle;
            this.size = this.defaultSize;
            this.angleReachZero = false;
          } 
        }
      }
      
      if (this.y < windowHeight / 2 && this.size < this.maxSize + 1 ) {
        this.size += this.speed/100;
      }

      if (this.y > windowHeight / 2 && this.size > this.minSize * 0.1 ) {
        this.size -= this.speed;
      }

      drawStar(this.x, this.y, this.size, this.opacity);
    }

    function createAllStars() {
      let starsTypes = getStarsTypes(windowWidth, windowHeight);
      for (let i = 0; i < starsTypes.length; i++) {
        for(let j = 0; j < STARS_NUMBER * starsTypes[i].amount; j++) {
          createStar(starsTypes[i])
        }
      }
      if (initAnimation) {
        drawAndUpdate();
      }
    }

    function createStar(star: any) {
      let startX = getRandomIntInclusive(star.startX - windowWidth * 0.2, star.startX + windowWidth * 0.2);
      let startY = getRandomIntInclusive(star.startY - windowHeight * 0.2, star.startY + windowHeight * 0.2);
      let direction = star.direction;
      let radius = getRandomIntInclusive(star.radius, star.radius);
      let startAngle = getRandomAngle(star.startAngle, star.endAngle);
      let endAngle = star.endAngle;
      let speed = getRandomIntInclusive(star.minSpeed, star.maxSpeed) * 0.0003;
      let size = getRandomIntInclusive(star.minSize, star.maxSize);
      let opacity = getRandomIntInclusive(MIN_STAR_OPACITY, MAX_STAR_OPACITY) * 0.1;
      stars.push(
        new (Star as any)(
          startX, 
          startY, 
          radius, 
          speed, 
          size, 
          opacity, 
          direction, 
          startAngle, 
          endAngle,
          star.maxSize,
          star.startAngle
        )
      );
    }

    function drawStar(x: number, y: number, size: number, opacity: number){
      if (!c) return;
      c.beginPath();
      c.arc(x, y, size, 0, Math.PI * 2, false);
      c.closePath();
      c.fillStyle = `rgba(155, 165, 193, ${opacity})`;
      c.fill();
    }

    function drawAndUpdate() {
      if (!c) return;
      c.clearRect(0, 0, windowWidth, windowHeight);
      if (stars.length > 0) {
        stars.forEach(el => {
          el.update();
        });
        window.requestAnimationFrame(drawAndUpdate);
      }
    }

    function resetStars() {
      initAnimation = false;
      stars = [];
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      if (starfield) {
        starfield.width = windowWidth;
        starfield.height = windowHeight;
      }
      if (c) {
        c.clearRect(0, 0, windowWidth, windowHeight);
      }
      STARS_NUMBER = windowWidth / 4;
      createAllStars();
    }

    function getRandomIntInclusive(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function getAngle(sin: number, cos: number) {
      if ( sin > 0 && cos > 0  ) {
        return Math.asin(sin)*180/Math.PI;
      }
      if ( sin > 0 && cos < 0  ) {
        return 180 - Math.asin(sin)*180/Math.PI;
      }
      if ( sin < 0 && cos < 0  ) {
        return 180 - Math.asin(sin)*180/Math.PI;
      }
      if ( sin < 0 && cos > 0  ) {
        return 360 + Math.asin(sin)*180/Math.PI; 
      }
      return 0;
    }

    function getRandomAngle(startAngle: number, endAngle: number) {
      if (endAngle - startAngle < 0 && endAngle < 180) {
        let randomAngle = getRandomIntInclusive(0, 360 - startAngle + endAngle)
        return startAngle + randomAngle > 360 ? getRandomIntInclusive(0, endAngle) : startAngle + randomAngle;
      }
      if (endAngle - startAngle < 0) {
        return getRandomIntInclusive(endAngle, startAngle);
      }
      return getRandomIntInclusive(startAngle, endAngle);
    }

    createAllStars();
    window.addEventListener('resize', resetStars);
    return () => {
      window.removeEventListener('resize', resetStars);
    };
  }, []);

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

  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Routes>
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/ground-station" element={<GroundStation />} />
      <Route path="/services/composite-manufacturing" element={<Kompozit />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/" element={
        <div className="min-h-screen bg-background text-foreground relative" style={{zIndex: 1}}>
          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/905365821902?text=Merhaba, Uzinovas ile ilgili bilgi almak istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-6 bottom-6 z-50 group"
          >
            <div className="relative">
              {/* Floating Animation */}
              <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
              
              {/* Button */}
              <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Bize WhatsApp'tan Ulaşın
              </div>
            </div>
          </a>

          {/* Navigation */}
          <Navbar transparent={false} />
          <div className="flex items-center space-x-4 px-4 md:px-8 lg:px-12">
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
         <div style={{ zIndex: 30 }} className="relative h-screen  ">
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
                <div className="relative h-24 mb-8 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl md:text-3xl font-bold tracking-wider space-text">
                      <span className="inline-block animate-typing delay-100 text-white space-word">Hayal Et </span> ,
                      <span className="inline-block animate-typing delay-200 text-white ml-4 space-word">Tasarla </span>,
                      <span className="inline-block animate-typing delay-300 text-white ml-4 space-word">Fırlat!</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const servicesSection = document.getElementById('services-section');
                    if (servicesSection) {
                      servicesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="star-button inline-block"
                >
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
                </button>
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

      

          {/* Services Binti Box with Space Theme */}
          <div id="services-section" className="py-20 bg-black relative overflow-hidden">
            <canvas ref={starfieldRef} className="starfield"></canvas>
            
            {/* Space Background Elements - keep as fallback */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071')] bg-cover bg-center opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90"></div>
            
            {/* Add CSS for stars */}
            <style>
              {`
                .stars-container {
                  perspective: 500px;
                  position: absolute !important;
                  overflow: visible !important;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  z-index: 1 !important;
                }
                
                .stars, .stars2, .stars3 {
                  position: absolute !important;
                  overflow: visible !important;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  z-index: 1 !important;
                  background-image: 
                    radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                    radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0)),
                    radial-gradient(1px 1px at 230px 190px, #fff, rgba(0,0,0,0));
                  background-repeat: repeat;
                  background-size: 250px 250px;
                  animation: zoom 10s infinite;
                  transform-origin: center;
                }
                
                .stars, .stars2, .stars3 {
                  opacity: 0.7 !important;
                  background-image: 
                    radial-gradient(3px 3px at 20px 30px, white, rgba(0,0,0,0)),
                    radial-gradient(3px 3px at 40px 70px, white, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 90px 40px, white, rgba(0,0,0,0)),
                    radial-gradient(3px 3px at 160px 120px, white, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 230px 190px, white, rgba(0,0,0,0));
                  background-size: 200px 200px;
                }
                
                .stars {
                  background-position: 0 0;
                  animation-delay: 0s;
                }
                .stars2 {
                  background-position: 100px 50px;
                  animation-delay: 3s;
                }
                .stars3 {
                  background-position: 50px 100px;
                  animation-delay: 6s;
                }
                
                @keyframes zoom {
                  0% {
                    opacity: 0.7;
                    transform: scale(0.5) translateZ(-400px) rotate(0deg);
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    opacity: 0.7;
                    transform: scale(1.5) translateZ(0) rotate(360deg);
                  }
                }
                
                .bg-gradient-radial {
                  background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
                }
              `}
            </style>
            
            <div className="max-w-[95%] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
              {/* Main Header */}
              <div className="text-center mb-16">
                <div className="flex justify-center mb-4">
                  <img src={logo} alt="Uzinovas Logo" className="h-20 w-auto" />
                </div>
                <h1 className="text-white-600 mx-auto" style={{ fontStyle: 'italic', fontSize: '30px'}}>
                  "Uzinovas İle Tam İrtifa"
                </h1>
              </div>
              
              {/* NEW MODERN SERVICES LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 mb-20">
                {/* Composite Production Box - Large Box */}
                <div className="col-span-1 md:col-span-8 min-h-[400px] relative group overflow-hidden rounded-2xl shadow-2xl">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src="https://i.hizliresim.com/jpl388a.png" 
                      alt="Kompozit Üretimi" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="p-6 md:p-8 space-y-4">
                      <div className="inline-flex items-center space-x-2 bg-orange-500/30 backdrop-blur-sm p-2 rounded-full w-fit">
                        <Rocket className="h-4 w-4 md:h-5 md:w-5 text-orange-400" />
                        <span className="text-white font-bold pr-1 text-sm md:text-base">COMPOSITE</span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase text-white tracking-tighter leading-tight">
                          KOMPOZİT<br/>ÜRETİMİ
                        </h3>
                        <p className="text-gray-300 mt-2 md:mt-3 text-sm md:text-base max-w-lg leading-relaxed">
                          Yüksek performanslı kompozit malzemeler ve ileri üretim teknikleri ile roketlerinizin performansını maksimuma çıkarın.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-orange-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-orange-400 mr-2"></div>
                          <span className="text-gray-300">Karbon fiber üretimi</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-orange-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-orange-400 mr-2"></div>
                          <span className="text-gray-300">Kompozit parça üretimi</span>
                        </div>
                      </div>

                      {/* For Composite Production Box */}
                      <button className="group/btn bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 md:py-2.5 md:px-5 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 transform hover:translate-x-1 text-sm md:text-base w-fit">
                        <a href="https://uzinovas.com/#/services/composite-manufacturing" className="flex items-center space-x-2">
                          <span>KEŞFET</span>
                          <ArrowRight className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 3D Printing Box - Vertical Box */}
                <div className="col-span-1 md:col-span-4 min-h-[400px] relative group overflow-hidden rounded-2xl shadow-2xl">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src="https://i.hizliresim.com/bvja4sq.jpeg" 
                      alt="3D Baskı Hizmeti" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="p-6 md:p-8 space-y-4">
                      <div className="inline-flex items-center space-x-2 bg-blue-500/30 backdrop-blur-sm p-2 rounded-full w-fit">
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 20h12M12 4v16m0-16l6 3m-6-3L6 7m0 13l6-3 6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-white font-bold pr-1 text-sm md:text-base">3D PRINT</span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter leading-tight">
                          3D BASKI<br/>HİZMETİ
                        </h3>
                        <p className="text-gray-300 mt-2 md:mt-3 text-xs md:text-sm leading-relaxed">
                          Profesyonel 3D baskı hizmetimizle prototip ve son ürün parçalarınızı hassas bir şekilde üretiyoruz.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-blue-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400 mr-2"></div>
                          <span className="text-gray-300">Hızlı prototipleme</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-blue-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400 mr-2"></div>
                          <span className="text-gray-300">Özel parça üretimi</span>
                        </div>
                      </div>

                      {/* For 3D Printing Box */}
                      <button className="group/btn bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 md:py-2.5 md:px-5 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 transform hover:translate-x-1 text-sm md:text-base w-fit">
                        <a href="https://uzinovas.com/#/3d-model" className="flex items-center space-x-2">
                          <span>KEŞFET</span>
                          <ArrowRight className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Flight Control Cards Box - Horizontal Box */}
                <div className="col-span-1 md:col-span-6 min-h-[350px] relative group overflow-hidden rounded-2xl shadow-2xl">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src="https://i.hizliresim.com/3v7ileh.jpeg" 
                      alt="Uçuş Kontrol Kartları" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="p-6 md:p-8 space-y-4">
                      <div className="inline-flex items-center space-x-2 bg-green-500/30 backdrop-blur-sm p-2 rounded-full w-fit">
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 7h-3m3 0v3m0-3l-3 3M4 17h3m-3 0v-3m0 3l3-3M20 17h-3m3 0v-3m0 3l-3-3M4 7h3M4 7v3m0-3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-white font-bold pr-1 text-sm md:text-base">FLIGHT CONTROL</span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter">
                          UÇUŞ KONTROL<br/>KARTLARI
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-green-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-400 mr-2"></div>
                          <span className="text-gray-300">Hassas sensörler</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-green-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-400 mr-2"></div>
                          <span className="text-gray-300">Gerçek zamanlı veri</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-green-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-400 mr-2"></div>
                          <span className="text-gray-300">Otomatik kurtarma</span>
                        </div>
                      </div>

                      <button className="group/btn bg-green-500 hover:bg-green-600 text-white py-2 px-4 md:py-2.5 md:px-5 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 transform hover:translate-x-1 text-sm md:text-base w-fit">
                        <span>KEŞFET</span>
                        <ArrowRight className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Rocket Flight Materials Box - Medium Box */}
                <div className="col-span-1 md:col-span-6 min-h-[350px] relative group overflow-hidden rounded-2xl shadow-2xl">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src="https://i.hizliresim.com/qa7j2y2.jpg" 
                      alt="Roket Uçuş Malzemeleri" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center space-x-2 bg-purple-500/30 backdrop-blur-sm p-2 rounded-full w-fit">
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zM4 7l8 5m-8-5l8-5m0 10v10m0-10l8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-white font-bold pr-1 text-sm md:text-base">ROCKET PARTS</span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter">
                        ROKET UÇUŞ<br/>MALZEMELERİ
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-purple-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-purple-400 mr-2"></div>
                          <span className="text-gray-300">Motor yuvası</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-purple-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-purple-400 mr-2"></div>
                          <span className="text-gray-300">Paraşüt sistemleri</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-purple-500/30 flex items-center text-xs md:text-sm">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-purple-400 mr-2"></div>
                          <span className="text-gray-300">Kanatçıklar</span>
                        </div>
                      </div>
                      
                      {/* For Rocket Materials Box */}
                      <button className="group/btn bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 md:py-3 md:px-6 rounded-full font-bold flex items-center space-x-2 transition-all duration-300 transform hover:translate-x-1 w-fit text-sm md:text-base">
                        <a href="https://uzinovas.com/#/products" className="flex items-center space-x-2">
                          <span>KEŞFET</span>
                          <ArrowRight className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Middle - Sequence Animation */}
              <div className="mb-20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-amber-600/20 rounded-xl opacity-30"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 backdrop-blur-sm border border-orange-500/20 rounded-xl">
                  <div className="flex flex-col justify-center">
                    <h3 className="text-4xl font-black uppercase text-white mb-6 tracking-tight">
                      ROKET <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">YER İSTASYONU</span>
                    </h3>
                    
                    <p className="text-gray-300 mb-6">
                      TEKNOFEST hakem yer istasyonu ile tam uyumlu, takımınıza özel tasarlanmış yer istasyonu sistemleri. Gerçek zamanlı telemetri verisi, uçuş takibi ve veri kaydı özellikleriyle roket uçuşlarınızı profesyonel düzeyde kontrol edin.
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                      <span className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-orange-500/30 text-gray-300 text-xs md:text-sm"> Veri Takip Sistemi</span>
                      <span className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-orange-500/30 text-gray-300 text-xs md:text-sm">Veri Analizi</span>
                      <span className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-orange-500/30 text-gray-300 text-xs md:text-sm">Teknofest Hakem Yer İstasyonuna Uyumlu</span>
                    </div>
                    <div className="flex gap-4">
                      <Link 
                        to="/ground-station" 
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300"
                      >
                        KEŞFET
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center relative">
                    <div id="sequence-canvas-container" className="relative w-full h-80 overflow-hidden rounded-lg bg-black">
                      <canvas 
                        ref={seqref}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      {/* Rocket Flight Path */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path 
                          d="M 10,90 Q 50,10 90,90" 
                          fill="none" 
                          stroke="rgba(249, 115, 22, 0.4)" 
                          strokeWidth="1" 
                          strokeDasharray="2,2"
                          className="animate-dash"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row - Featured Products */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-1.5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    <h2 className="text-3xl md:text-4xl font-black uppercase text-white">ÖNE ÇIKAN ÜRÜNLER</h2>
                  </div>
                  <button className="flex items-center gap-2 bg-transparent border border-orange-500/50 text-white py-2 px-5 rounded-full text-sm font-bold hover:bg-orange-900/30 transition-colors">
                    <span>TÜM ÜRÜNLER</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-zinc-900/70 via-zinc-900/70 to-zinc-900/70 backdrop-blur-sm p-8 rounded-xl border border-orange-500/20">
                  <Carousel
                    additionalTransfrom={0}
                    arrows
                    autoPlay
                    autoPlaySpeed={3000}
                    centerMode={false}
                    containerClass="carousel-container"
                    dotListClass=""
                    draggable
                    focusOnSelect={false}
                    infinite
                    itemClass="px-3"
                    keyBoardControl
                    minimumTouchDrag={80}
                    pauseOnHover
                    renderArrowsWhenDisabled={false}
                    renderButtonGroupOutside={false}
                    renderDotsOutside={false}
                    responsive={{
                      desktop: {
                        breakpoint: {
                          max: 3000,
                          min: 1024
                        },
                        items: 4,
                        partialVisibilityGutter: 20
                      },
                      tablet: {
                        breakpoint: {
                          max: 1024,
                          min: 464
                        },
                        items: 2,
                        partialVisibilityGutter: 20
                      },
                      mobile: {
                        breakpoint: {
                          max: 464,
                          min: 0
                        },
                        items: 1,
                        partialVisibilityGutter: 15
                      }
                    }}
                    rewind={false}
                    rewindWithAnimation={false}
                    rtl={false}
                    shouldResetAutoplay
                    showDots={false}
                    sliderClass=""
                    slidesToSlide={1}
                    swipeable
                    customTransition="transform 500ms ease-in-out"
                    ssr={false}
                  >
                    {featuredProducts.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="h-full">
                        <div className="bg-zinc-800/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg shadow-orange-500/10 border border-orange-500/20 h-full transform transition-transform hover:scale-105">
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
              
              {/* Bottom Section - CTA and Back to Top */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact CTA */}
                <div className="bg-gradient-to-r from-zinc-900/70 to-zinc-900/70 backdrop-blur-sm p-8 rounded-xl border border-orange-500/20">
                  <h3 className="text-3xl font-black uppercase text-white mb-6">
                    UZAY YOLCULUĞUNUZ <br />BAŞLASIN
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Profesyonel ekibimiz ve projelerinizde etkin çözümlerle yanınızdayız.
                  </p>
                  <div className="flex gap-4">
                    <Link 
                      to="/contact" 
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all duration-300"
                    >
                      İLETİŞİME GEÇ
                    </Link>
                  </div>
                </div>
                
                {/* Back to Top Button */}
                
              </div>

              {/* Add CSS for animations */}
              <style>
                {`
                  @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                  }
                  
                  @keyframes dash {
                    to {
                      stroke-dashoffset: 10;
                    }
                  }
                  
                  .animate-dash {
                    animation: dash 15s linear infinite;
                  }

                  .space-text {
                    position: relative;
                  }

                  .space-word {
                    position: relative;
                    animation: float 3s ease-in-out infinite;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                  }

                  .space-word::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(45deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8));
                    background-size: 400%;
                    z-index: -1;
                    filter: blur(8px);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    animation: glow 2s linear infinite;
                  }

                  .space-word:hover::before {
                    opacity: 0.7;
                  }

                  @keyframes float {
                    0%, 100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-10px);
                    }
                  }

                  @keyframes glow {
                    0% {
                      background-position: 0 0;
                    }
                    50% {
                      background-position: 400% 0;
                    }
                    100% {
                      background-position: 0 0;
                    }
                  }

                  .space-word:nth-child(1) {
                    animation-delay: 0s;
                  }

                  .space-word:nth-child(2) {
                    animation-delay: 0.2s;
                  }

                  .space-word:nth-child(3) {
                    animation-delay: 0.4s;
                  }
                `}
              </style>
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

     
          {/* Floating Rocket Button with Advanced Animation */}
          <button
            onClick={scrollToTop}
            className={`fixed bottom-8 left-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 transform ${
              showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            } hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] group overflow-hidden`}
          >
            {/* Rocket Launch Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Pulsing Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700"></div>
              
              {/* Launch Platform */}
              <div className="absolute bottom-1 w-8 h-1 bg-gray-700 rounded-full opacity-100 group-hover:opacity-0 transition-all duration-500 delay-300"></div>
              
              {/* Model Rocket SVG - Thin with pointed tip */}
              <div className="relative transform transition-all duration-700 ease-out group-hover:-translate-y-8 z-10">
                <svg 
                  className="w-10 h-10 transform group-hover:scale-90"
                  viewBox="0 0 24 60" 
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Sharp Nose Cone */}
                  <path 
                    d="M12 2L9 12L15 12L12 2Z" 
                    fill="#f5f5f5" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Main Body - Thin and elongated */}
                  <path 
                    d="M9 12L9 40L15 40L15 12L9 12Z" 
                    fill="#f5f5f5" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Separation Line */}
                  <line 
                    x1="9" y1="18" x2="15" y2="18" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Fins - Small and realistic */}
                  <path 
                    d="M9 35L5 45L9 40L9 35Z" 
                    fill="#ff6b6b" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  <path 
                    d="M15 35L19 45L15 40L15 35Z" 
                    fill="#ff6b6b" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  <path 
                    d="M12 44L9 40L15 40L12 44Z" 
                    fill="#ff6b6b" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Engine Tube */}
                  <path 
                    d="M10 40L10 45L14 45L14 40L10 40Z" 
                    fill="#cccccc" 
                    stroke="#d1d1d1" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Engine Nozzle */}
                  <path 
                    d="M10 45L10 47L14 47L14 45L10 45Z" 
                    fill="#555555" 
                    stroke="#444444" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Detail Stripes */}
                  <line 
                    x1="9" y1="25" x2="15" y2="25" 
                    stroke="#ff6b6b" 
                    strokeWidth="1"
                  />
                  <line 
                    x1="9" y1="30" x2="15" y2="30" 
                    stroke="#ff6b6b" 
                    strokeWidth="1"
                  />
                  
                  {/* Brand Label */}
                  <rect 
                    x="10.5" y="20" width="3" height="1" 
                    fill="#2563eb" 
                    strokeWidth="0"
                  />
                </svg>
              
                {/* Flame Effects - Attached to rocket bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 origin-top">
                  {/* Main Flame */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 
                    bg-gradient-to-t from-orange-500 via-yellow-400 to-red-500 
                    group-hover:animate-flame rounded-full blur-[2px]"></div>
                  
                  {/* Side Flames */}
                  <div className="absolute top-0 left-1/2 -translate-x-[5px] w-0.5 h-2 
                    bg-gradient-to-t from-orange-500 via-yellow-400 to-red-500 
                    group-hover:animate-flame-side-1 rounded-full blur-[1px]"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-[-1px] w-0.5 h-2 
                    bg-gradient-to-t from-orange-500 via-yellow-400 to-red-500 
                    group-hover:animate-flame-side-2 rounded-full blur-[1px]"></div>
                </div>
              </div>
              
              {/* Smoke/Cloud Particles - These remain at the base position */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 scale-0 group-hover:scale-100 transition-transform duration-1000">
                  <div className="absolute w-2 h-2 rounded-full bg-white/30 blur-[3px] group-hover:animate-particle-1"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-white/20 blur-[4px] group-hover:animate-particle-2 delay-100"></div>
                  <div className="absolute w-3 h-3 rounded-full bg-white/30 blur-[3px] group-hover:animate-particle-3 delay-150"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-white/20 blur-[2px] group-hover:animate-particle-4 delay-75"></div>
                </div>
              </div>
              
              {/* Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-white/20 scale-0 group-hover:scale-100 transition-transform duration-1000 group-hover:animate-orbit"></div>
            </div>
          </button>

          {/* Add CSS Animation Keyframes */}
          <style>{`
            @keyframes flame {
              0%, 100% { height: 3px; opacity: 0.8; }
              50% { height: 8px; opacity: 1; }
            }
            
            @keyframes flame-side-1 {
              0%, 100% { transform: translateX(-1px) translateY(0); height: 2px; opacity: 0.6; }
              50% { transform: translateX(-3px) translateY(-2px); height: 4px; opacity: 0.8; }
            }
            
            @keyframes flame-side-2 {
              0%, 100% { transform: translateX(1px) translateY(0); height: 2px; opacity: 0.6; }
              50% { transform: translateX(3px) translateY(-2px); height: 4px; opacity: 0.8; }
            }
            
            @keyframes particle-1 {
              0% { transform: translate(-5px, 0) scale(0); opacity: 0; }
              40% { opacity: 0.7; }
              100% { transform: translate(-10px, -20px) scale(2); opacity: 0; }
            }
            
            @keyframes particle-2 {
              0% { transform: translate(5px, 0) scale(0); opacity: 0; }
              40% { opacity: 0.7; }
              100% { transform: translate(15px, -25px) scale(2.5); opacity: 0; }
            }
            
            @keyframes particle-3 {
              0% { transform: translate(-8px, 0) scale(0); opacity: 0; }
              40% { opacity: 0.6; }
              100% { transform: translate(-18px, -15px) scale(2); opacity: 0; }
            }
            
            @keyframes particle-4 {
              0% { transform: translate(8px, 0) scale(0); opacity: 0; }
              40% { opacity: 0.5; }
              100% { transform: translate(12px, -20px) scale(1.5); opacity: 0; }
            }
            
            @keyframes orbit {
              0% { transform: scale(0.7) rotate(0deg); }
              100% { transform: scale(1.2) rotate(360deg); }
            }
            
            .group:hover .animate-flame {
              animation: flame 0.8s infinite;
            }
            
            .group:hover .animate-flame-side-1 {
              animation: flame-side-1 0.9s infinite;
            }
            
            .group:hover .animate-flame-side-2 {
              animation: flame-side-2 0.9s infinite;
            }
            
            .group:hover .animate-particle-1 {
              animation: particle-1 1.5s ease-out infinite;
            }
            
            .group:hover .animate-particle-2 {
              animation: particle-2 1.7s ease-out infinite;
            }
            
            .group:hover .animate-particle-3 {
              animation: particle-3 1.6s ease-out infinite;
            }
            
            .group:hover .animate-particle-4 {
              animation: particle-4 1.4s ease-out infinite;
            }
            
            .group:hover .animate-orbit {
              animation: orbit 8s linear infinite;
            }
          `}</style>

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
                      <li>E-posta: info@uzinova.com</li>
                      <li>Telefon: +90 536 582 19 02</li>
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
