import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { ShoppingCart, Plus, X, Check, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

// Import rocket part images
import rocketNose from '../rocket Parts/1x/Rocket Nose_1.svg';
import rocketFins from '../rocket Parts/1x/Rocket Fins.svg';
import rocketBody from '../rocket Parts/1x/Rocket Body_1.svg';

interface RocketPart {
  id: string;
  name: string;
  dimensions: {
    length: string;
    diameter: string;
    wallThickness: string;
    shape?: string;
    shoulderLength?: string;
    shoulderDiameter?: string;
    numSections?: string;
    couplerLength?: string;
    couplerDiameter?: string;
    finCount?: string;
    rootChord?: string;
    tipChord?: string;
    sweepLength?: string;
    height?: string;
    finThickness?: string;
    finShape?: string;
    position?: string;
  };
  material: string;
}

const Kompozit: React.FC = () => {
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number }[]>([]);
  const [selectedParts, setSelectedParts] = useState<Record<string, RocketPart>>({});
  const [currentPart, setCurrentPart] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    length: '',
    diameter: '',
    wallThickness: '2',
    shape: 'ogive',
    shoulderLength: '',
    shoulderDiameter: '',
    numSections: '1',
    couplerLength: '',
    couplerDiameter: '',
    finCount: '3',
    rootChord: '',
    tipChord: '',
    sweepLength: '',
    height: '',
    finThickness: '3',
    finShape: 'trapezoidal',
    position: '0'
  });
  const [material, setMaterial] = useState<string>('karbon');
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    partSpecific: true
  });

  const { addToCart } = useCart();
  const toast = useToast();

  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate stars effect
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3
      }));
      setStars(newStars);
    };

    generateStars();
    const interval = setInterval(generateStars, 5000); // Regenerate stars every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Reset part-specific dimensions when changing part type
  useEffect(() => {
    if (currentPart) {
      // Reset only part-specific fields, keep general ones
      setDimensions(prev => ({
        ...prev,
        // Reset nose cone specific if not nose
        shape: currentPart === 'nose' ? prev.shape : 'ogive',
        shoulderLength: currentPart === 'nose' ? prev.shoulderLength : '',
        shoulderDiameter: currentPart === 'nose' ? prev.shoulderDiameter : '',
        // Reset body specific if not body
        numSections: currentPart === 'body' ? prev.numSections : '1',
        couplerLength: currentPart === 'body' ? prev.couplerLength : '',
        couplerDiameter: currentPart === 'body' ? prev.couplerDiameter : '',
        // Reset fin specific if not tail
        finCount: currentPart === 'tail' ? prev.finCount : '3',
        rootChord: currentPart === 'tail' ? prev.rootChord : '',
        tipChord: currentPart === 'tail' ? prev.tipChord : '',
        sweepLength: currentPart === 'tail' ? prev.sweepLength : '',
        height: currentPart === 'tail' ? prev.height : '',
        finThickness: currentPart === 'tail' ? prev.finThickness : '3',
        finShape: currentPart === 'tail' ? prev.finShape : 'trapezoidal',
        position: currentPart === 'tail' ? prev.position : '0',
      }));
    }
  }, [currentPart]);

  const handlePartClick = (partId: string) => {
    console.log('Part clicked:', partId); // Debug log
    setCurrentPart(partId);
    // Basic dimensions will be reset, specific ones are handled in useEffect
    setDimensions(prev => ({
      ...prev,
      length: '',
      diameter: '',
      wallThickness: '2', // Default remains
    }));
    setMaterial('karbon');
  };

  const handleAddPart = () => {
    if (!currentPart || !dimensions.length || !dimensions.diameter) {
      console.log('Missing dimensions:', { currentPart, dimensions }); // Debug log
      return;
    }

    const partName = 
      currentPart === 'nose' ? 'Burun Konisi' :
      currentPart === 'body' ? 'Gövde' :
      'Kanat';

    console.log('Adding part:', { currentPart, partName, dimensions, material }); // Debug log

    // Create part object based on part type with only relevant parameters
    let partDimensions = {
      length: dimensions.length,
      diameter: dimensions.diameter,
      wallThickness: dimensions.wallThickness,
    };

    // Add part-specific dimensions
    if (currentPart === 'nose') {
      partDimensions = {
        ...partDimensions,
        shape: dimensions.shape,
        shoulderLength: dimensions.shoulderLength || '0',
        shoulderDiameter: dimensions.shoulderDiameter || '0',
      };
    } else if (currentPart === 'body') {
      partDimensions = {
        ...partDimensions,
        numSections: dimensions.numSections,
        couplerLength: dimensions.couplerLength || '0',
        couplerDiameter: dimensions.couplerDiameter || '0',
      };
    } else if (currentPart === 'tail') {
      partDimensions = {
        ...partDimensions,
        finCount: dimensions.finCount,
        rootChord: dimensions.rootChord || '0',
        tipChord: dimensions.tipChord || '0',
        sweepLength: dimensions.sweepLength || '0',
        height: dimensions.height || '0',
        finThickness: dimensions.finThickness,
        finShape: dimensions.finShape,
        position: dimensions.position,
      };
    }

    setSelectedParts(prev => {
      const newParts = {
        ...prev,
        [currentPart]: {
          id: currentPart,
          name: partName,
          dimensions: partDimensions,
          material: material
        }
      };
      console.log('Updated selected parts:', newParts); // Debug log
      return newParts;
    });

    setCurrentPart(null);
    setDimensions(prev => ({
      ...prev,
      length: '',
      diameter: '',
    }));
    toast.success('Parça eklendi');
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(prev => {
      const newParts = { ...prev };
      delete newParts[partId];
      return newParts;
    });
    toast.info('Parça çıkarıldı');
  };

  const handleAddToCart = () => {
    console.log('Add to Cart button clicked, selectedParts:', selectedParts);
    if (Object.keys(selectedParts).length > 0) {
      const parts = Object.values(selectedParts);
      parts.forEach(part => {
        // Create more detailed description based on part type
        let detailedDescription = `Uzunluk: ${part.dimensions.length}mm, Çap: ${part.dimensions.diameter}mm, Cidar: ${part.dimensions.wallThickness}mm, Malzeme: ${part.material === 'karbon' ? 'Karbon Fiber' : 'Cam Elyaf'}`;
        
        if (part.id === 'nose') {
          const shapeNames = {
            'ogive': 'Ogive',
            'conical': 'Konik',
            'parabolic': 'Parabolik',
            'elliptical': 'Eliptik',
            'haack': 'Haack'
          };
          detailedDescription += `, Şekil: ${shapeNames[part.dimensions.shape as keyof typeof shapeNames]}`;
          if (part.dimensions.shoulderLength && part.dimensions.shoulderDiameter) {
            detailedDescription += `, Omuz: ${part.dimensions.shoulderLength}mm × ${part.dimensions.shoulderDiameter}mm`;
          }
        } else if (part.id === 'body') {
          detailedDescription += `, Bölüm: ${part.dimensions.numSections}`;
          if (part.dimensions.couplerLength && part.dimensions.couplerDiameter) {
            detailedDescription += `, Birleştirici: ${part.dimensions.couplerLength}mm × ${part.dimensions.couplerDiameter}mm`;
          }
        } else if (part.id === 'tail') {
          const shapeNames = {
            'trapezoidal': 'Yamuk',
            'elliptical': 'Eliptik',
            'triangular': 'Üçgen',
            'clipped': 'Kesilmiş Delta'
          };
          detailedDescription += `, ${part.dimensions.finCount} Kanat, Şekil: ${shapeNames[part.dimensions.finShape as keyof typeof shapeNames]}, Kalınlık: ${part.dimensions.finThickness}mm`;
          if (part.dimensions.rootChord && part.dimensions.tipChord) {
            detailedDescription += `, Kök: ${part.dimensions.rootChord}mm, Uç: ${part.dimensions.tipChord}mm`;
          }
          if (part.dimensions.height && part.dimensions.sweepLength) {
            detailedDescription += `, Yükseklik: ${part.dimensions.height}mm, Süpürme: ${part.dimensions.sweepLength}mm`;
          }
          if (part.dimensions.position) {
            detailedDescription += `, Konum: ${part.dimensions.position}mm`;
          }
        }
        
        const cartItem = {
          productId: part.id,
          name: `Kompozit ${part.name} (${part.material === 'karbon' ? 'Karbon Fiber' : 'Cam Elyaf'})`,
          price: 0, // Price will be determined later
          quantity: 1,
          image: part.id === 'nose' ? rocketNose : part.id === 'body' ? rocketBody : rocketFins,
          description: detailedDescription
        };
        console.log('Adding to cart:', cartItem);
        addToCart(cartItem);
      });
      setSelectedParts({});
      toast.success('Ürünler sepete eklendi');
    } else {
      toast.error('Lütfen en az bir parça seçin');
    }
  };

  const toggleSection = (section: 'general' | 'partSpecific') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <style>
        {`
          .nav-link, .text-foreground {
            color: white !important;
          }
          .nav-link:hover, .text-foreground:hover {
            color: #F97316 !important;
          }
          .bg-background95 {
            background-color: black !important;
          }
          .part-selected {
            filter: drop-shadow(0 0 15px rgba(249, 115, 22, 0.7)) brightness(1.3) !important;
            transform: scale(1.05);
          }
          .part-selected img {
            filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.7)) !important;
            stroke: #F97316 !important;
            stroke-width: 2px !important;
          }
          .part-selected path {
            stroke: #F97316 !important;
            stroke-width: 3px !important;
          }
          .material-option {
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.375rem;
            transition: all 0.3s;
          }
          .material-option.selected {
            background-color: rgba(249, 115, 22, 0.2);
            border-color: #F97316;
          }
          @keyframes gridMove {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 0 20px;
            }
          }

          .rocket-container {
            position: relative;
            isolation: isolate;
          }

          .rocket-container::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, transparent 30%, black 70%);
            pointer-events: none;
            z-index: 1;
          }

          .glow-effect {
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(249, 115, 22, 0.2), transparent 70%);
            filter: blur(20px);
            pointer-events: none;
          }
        `}
      </style>
      <Navbar transparent={false} />
      <div className="min-h-screen bg-black text-white pt-16 relative overflow-hidden">
        {/* Starfield Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute bg-white rounded-full transition-opacity duration-1000"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-orange-500">
              Kompozit Roket Parçaları
            </h1>
            <p className="text-xl text-orange-200/80 max-w-3xl mx-auto">
              Yüksek performanslı kompozit roket parçaları ile projelerinizi bir üst seviyeye taşıyın. 
              Özelleştirilebilir boyutlar ve profesyonel üretim kalitesi.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {([
              { label: 'Başarılı Proje', value: '20+' },
              { label: 'Müşteri Memnuniyeti', value: '%99' },
              { label: 'Yıllık Tecrübe', value: '6+' },
              { label: 'Test Başarı Oranı', value: '%99.9' }
            ] as const).map((stat, index) => (
              <div key={index} className="bg-black p-6 rounded-lg border border-[rgba(249,115,22,0.2)]">
                <div className="text-3xl font-bold text-orange-500 mb-2">{stat.value}</div>
                <div className="text-orange-200/80">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Rocket Design Interface */}
            <div className="space-y-8">
              <div className="bg-black rounded-lg p-6 border border-[rgba(249,115,22,0.2)]">
                <h2 className="text-2xl font-semibold mb-4 text-orange-500">
                  Roket Parçaları
                </h2>
                <p className="text-orange-200/80 mb-6">
                  İhtiyacınıza uygun roket parçasını seçin ve özelleştirin. Her parça yüksek kalite standartlarında üretilmektedir.
                </p>
                <div style={{
                  backgroundColor: 'black',
                  borderRadius: '1rem',
                  height: '800px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)',
                  border: '1px solid rgba(249, 115, 22, 0.2)'
                } as React.CSSProperties}>
                  {/* Grid Background */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(rgba(249, 115, 22, 0.2) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(249, 115, 22, 0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    transform: 'perspective(500px) rotateX(60deg)',
                    transformOrigin: 'center center',
                    animation: 'gridMove 20s linear infinite'
                  }}></div>

                  {/* Animated Circles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: '1px solid rgba(249, 115, 22, 0.1)',
                        left: '50%',
                        top: '50%'
                      }}
                      animate={{
                        scale: [1, 2],
                        opacity: [0.5, 0],
                        x: '-50%',
                        y: '-50%'
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'linear'
                      }}
                    />
                  ))}

                  {/* Floating Particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute bg-orange-500"
                      style={{
                        width: '2px',
                        height: '2px',
                        borderRadius: '50%',
                        opacity: 0.3
                      }}
                      animate={{
                        x: [
                          Math.random() * 400 - 200,
                          Math.random() * 400 - 200
                        ],
                        y: [
                          Math.random() * 800 - 400,
                          Math.random() * 800 - 400
                        ],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  ))}

                  {/* Scanning Line Effect */}
                  <motion.div
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                    animate={{
                      y: [-400, 400]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={{
                      opacity: 0.3
                    }}
                  />

                  {/* Complete Rocket Container */}
                  <div style={{
                    position: 'relative',
                    height: '700px',
                    width: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 10
                  } as React.CSSProperties}>
                    {/* Nose Cone */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '0px',
                        width: '60px',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                      onClick={() => handlePartClick('nose')}
                      whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))' }}
                      className={`transition-all duration-300 ${currentPart === 'nose' ? 'part-selected' : ''}`}
                    >
                      <div style={{
                        position: 'absolute',
                        left: '-40px',
                        top: '50%',
                        width: '40px',
                        height: '2px',
                        background: currentPart === 'nose' ? '#F97316' : 'linear-gradient(90deg, transparent, #F97316)'
                      }}></div>
                      <img 
                        src={rocketNose}
                        alt="Rocket Nose"
                        style={{
                          width: '100%',
                          filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(249, 115, 22, 0.3))'
                        }}
                        className="transition-all duration-300"
                      />
                    </motion.div>

                    {/* Body */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '250px',
                        width: '120px',
                        cursor: 'pointer',
                        zIndex: 10,
                        scale: 1.5
                      }}
                      onClick={() => handlePartClick('body')}
                      whileHover={{ scale: 1.6 }}
                      className={`transition-all duration-300 ${currentPart === 'body' ? 'part-selected' : ''}`}
                    >
                      <div style={{
                        position: 'absolute',
                        left: '-40px',
                        top: '50%',
                        width: '40px',
                        height: '2px',
                        background: currentPart === 'body' ? '#F97316' : 'linear-gradient(90deg, transparent, #F97316)'
                      }}></div>
                      <svg 
                        viewBox="0 0 65.98 507.94"
                        style={{
                          width: '100%',
                          height: '300px',
                          filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.3))'
                        }}
                        className="transition-all duration-300"
                      >
                        <defs>
                          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#F97316', stopOpacity: 1 } as React.CSSProperties} />
                            <stop offset="100%" style={{ stopColor: '#FB923C', stopOpacity: 1 } as React.CSSProperties} />
                          </linearGradient>
                        </defs>
                        <path 
                          fill="white"
                          stroke={currentPart === 'body' ? '#F97316' : 'white'}
                          strokeWidth={currentPart === 'body' ? "4" : "3"}
                          d="M4.43,4.43h57.13s0,499.08,0,499.08H4.43s0-499.08,0-499.08M0,0v507.94s65.98,0,65.98,0V0S0,0,0,0H0Z"
                          className="transition-all duration-300"
                          style={{
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                          }}
                        />
                      </svg>
                    </motion.div>

                    {/* Fins */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '500px',
                        width: '100px',
                        cursor: 'pointer',
                        scale: 1.2,
                        zIndex: 10
                      }}
                      onClick={() => handlePartClick('tail')}
                      whileHover={{ scale: 1.25, filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))' }}
                      className={`transition-all duration-300 ${currentPart === 'tail' ? 'part-selected' : ''}`}
                    >
                      <div style={{
                        position: 'absolute',
                        left: '-40px',
                        top: '50%',
                        width: '40px',
                        height: '2px',
                        background: currentPart === 'tail' ? '#F97316' : 'linear-gradient(90deg, transparent, #F97316)'
                      }}></div>
                      <img 
                        src={rocketFins}
                        alt="Rocket Fins"
                        style={{
                          width: '100%',
                          filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(249, 115, 22, 0.3))'
                        }}
                        className="transition-all duration-300"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

               
            </div>

            {/* Form and Info Section */}
            <div className="space-y-8">
              {/* Form Section */}
              <div className="bg-black rounded-lg p-8 border border-[rgba(249,115,22,0.2)]">
                {currentPart ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-orange-500">
                        {currentPart === 'nose' ? 'Burun Konisi' : 
                         currentPart === 'body' ? 'Gövde' : 'Kanat'}  
                      </h2>
                      <button
                        onClick={() => setCurrentPart(null)}
                        className="text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* General Parameters Section - Collapsible */}
                      <div className="rounded-md border border-[rgba(249,115,22,0.2)] overflow-hidden">
                        <div 
                          className="flex justify-between items-center p-3 bg-black/30 cursor-pointer"
                          onClick={() => toggleSection('general')}
                        >
                          <h3 className="text-orange-400 font-medium">Genel Parametreler / General Parameters</h3>
                          {expandedSections.general ? 
                            <ChevronUp className="w-5 h-5 text-orange-400" /> : 
                            <ChevronDown className="w-5 h-5 text-orange-400" />
                          }
                        </div>
                        
                        {expandedSections.general && (
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-orange-400">Uzunluk / Length (mm)</label>
                                <input
                                  type="number"
                                  name="length"
                                  value={dimensions.length}
                                  onChange={(e) => setDimensions(prev => ({ ...prev, length: e.target.value }))}
                                  className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-orange-400">Çap / Diameter (mm)</label>
                                <input
                                  type="number"
                                  name="diameter"
                                  value={dimensions.diameter}
                                  onChange={(e) => setDimensions(prev => ({ ...prev, diameter: e.target.value }))}
                                  className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                  required
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2 text-orange-400">Cidar Kalınlığı / Wall Thickness (mm)</label>
                              <input
                                type="number"
                                name="wallThickness"
                                value={dimensions.wallThickness}
                                onChange={(e) => setDimensions(prev => ({ ...prev, wallThickness: e.target.value }))}
                                className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                              />
                            </div>

                            {/* Material Selection */}
                            <div>
                              <label className="block text-sm font-medium mb-2 text-orange-400">Malzeme / Material</label>
                              <div className="grid grid-cols-2 gap-4">
                                <div 
                                  className={`material-option flex items-center border border-[rgba(249,115,22,0.2)] rounded-md ${material === 'karbon' ? 'selected' : ''}`}
                                  onClick={() => setMaterial('karbon')}
                                >
                                  <div className="p-2 bg-black/30 rounded-l-md">
                                    {material === 'karbon' && <Check className="w-5 h-5 text-orange-500" />}
                                  </div>
                                  <div className="pl-2">Karbon Fiber  </div>
                                </div>
                                <div 
                                  className={`material-option flex items-center border border-[rgba(249,115,22,0.2)] rounded-md ${material === 'cam' ? 'selected' : ''}`}
                                  onClick={() => setMaterial('cam')}
                                >
                                  <div className="p-2 bg-black/30 rounded-l-md">
                                    {material === 'cam' && <Check className="w-5 h-5 text-orange-500" />}
                                  </div>
                                  <div className="pl-2">Cam Elyaf </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Part-Specific Parameters Section - Collapsible */}
                      <div className="rounded-md border border-[rgba(249,115,22,0.2)] overflow-hidden">
                        <div 
                          className="flex justify-between items-center p-3 bg-black/30 cursor-pointer"
                          onClick={() => toggleSection('partSpecific')}
                        >
                          <h3 className="text-orange-400 font-medium">
                            {currentPart === 'nose' ? 'Burun Konisi Detayları / Nose Cone Details' : 
                             currentPart === 'body' ? 'Gövde Detayları / Body Tube Details' : 
                             'Kanatçık Detayları / Fin Details'}
                          </h3>
                          {expandedSections.partSpecific ? 
                            <ChevronUp className="w-5 h-5 text-orange-400" /> : 
                            <ChevronDown className="w-5 h-5 text-orange-400" />
                          }
                        </div>
                        
                        {expandedSections.partSpecific && (
                          <div className="p-4 space-y-4">
                            {/* Nose Cone Specific Params */}
                            {currentPart === 'nose' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-orange-400">Burun Şekli / Nose Shape</label>
                                  <div className="relative">
                                    <select
                                      value={dimensions.shape}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, shape: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 appearance-none"
                                    >
                                      <option value="ogive">Ogive / Ogive</option>
                                      <option value="conical">Konik / Conical</option>
                                      <option value="parabolic">Parabolik / Parabolic</option>
                                      <option value="elliptical">Eliptik / Elliptical</option>
                                      <option value="haack">Haack / Haack</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                      <ChevronDown className="w-5 h-5 text-orange-400" />
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Omuz Uzunluğu / Shoulder Length (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.shoulderLength}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, shoulderLength: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Omuz Çapı / Shoulder Diameter (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.shoulderDiameter}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, shoulderDiameter: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Body Tube Specific Params */}
                            {currentPart === 'body' && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-orange-400">Bölüm Sayısı / Number of Sections</label>
                                  <input
                                    type="number"
                                    value={dimensions.numSections}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, numSections: e.target.value }))}
                                    className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Birleştirici Uzunluğu / Couplers Length (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.couplerLength}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, couplerLength: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Birleştirici Çapı / Couplers Diameter (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.couplerDiameter}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, couplerDiameter: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Fin Specific Params */}
                            {currentPart === 'tail' && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Kanat Sayısı / Number of Fins</label>
                                    <input
                                      type="number"
                                      value={dimensions.finCount}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, finCount: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Kanat Kalınlığı / Fin Thickness (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.finThickness}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, finThickness: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-orange-400">Kanat Şekli / Fin Shape</label>
                                  <div className="relative">
                                    <select
                                      value={dimensions.finShape}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, finShape: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 appearance-none"
                                    >
                                      <option value="trapezoidal">Yamuk / Trapezoidal</option>
                                      <option value="elliptical">Eliptik / Elliptical</option>
                                      <option value="triangular">Üçgen / Triangular</option>
                                      <option value="clipped">Kesilmiş Delta / Clipped Delta</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                      <ChevronDown className="w-5 h-5 text-orange-400" />
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Kök Uzunluğu / Root Chord (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.rootChord}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, rootChord: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Uç Uzunluğu / Tip Chord (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.tipChord}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, tipChord: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Süpürme Uzunluğu / Sweep Length (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.sweepLength}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, sweepLength: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-orange-400">Yükseklik / Height (mm)</label>
                                    <input
                                      type="number"
                                      value={dimensions.height}
                                      onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                                      className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-orange-400">Konum / Position (mm from body end)</label>
                                  <input
                                    type="number"
                                    value={dimensions.position}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, position: e.target.value }))}
                                    className="w-full px-4 py-2 bg-black/50 border border-[rgba(249,115,22,0.2)] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleAddPart}
                        disabled={!dimensions.length || !dimensions.diameter}
                        className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5 inline-block mr-2" />
                        Parça Ekle / Add Part
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl text-orange-500/30 mb-4">↑</div>
                    <p className="text-xl text-orange-500/60">Lütfen bir roket parçası seçin</p>
                    <p className="text-orange-200/50 mt-2">Özelleştirmek istediğiniz parçaya tıklayın</p>
                  </div>
                )}
              </div>
 {/* Selected Parts List */}
              <div className="bg-black rounded-lg p-6 border border-[rgba(249,115,22,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-orange-400">Seçilen Parçalar</h3>
                </div>
                <div className="space-y-4">
                  {Object.values(selectedParts).map((part) => (
                    <div key={part.id} className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-[rgba(249,115,22,0.1)]">
                      <div className="w-full">
                        <div className="flex justify-between">
                          <h4 className="text-orange-400 font-medium">{part.name}</h4>
                          <button
                            onClick={() => handleRemovePart(part.id)}
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* General Specs */}
                        <p className="text-sm text-orange-200/70 mb-2">
                          <b>Temel:</b> {part.dimensions.length}mm × {part.dimensions.diameter}mm, Cidar: {part.dimensions.wallThickness}mm
                        </p>
                        <p className="text-sm text-orange-200/70 mb-2">
                          <b>Malzeme:</b> {part.material === 'karbon' ? 'Karbon Fiber' : 'Cam Elyaf'}
                        </p>
                        
                        {/* Specific Parameters */}
                        {part.id === 'nose' && (
                          <div className="text-sm text-orange-200/70">
                            <p><b>Şekil:</b> {
                              part.dimensions.shape === 'ogive' ? 'Ogive' :
                              part.dimensions.shape === 'conical' ? 'Konik' : 
                              part.dimensions.shape === 'parabolic' ? 'Parabolik' :
                              part.dimensions.shape === 'elliptical' ? 'Eliptik' : 'Haack'
                            }</p>
                            {part.dimensions.shoulderLength && part.dimensions.shoulderDiameter && (
                              <p><b>Omuz:</b> {part.dimensions.shoulderLength}mm × {part.dimensions.shoulderDiameter}mm çap</p>
                            )}
                          </div>
                        )}
                        
                        {part.id === 'body' && (
                          <div className="text-sm text-orange-200/70">
                            <p><b>Bölüm Sayısı:</b> {part.dimensions.numSections}</p>
                            {part.dimensions.couplerLength && part.dimensions.couplerDiameter && (
                              <p><b>Birleştirici:</b> {part.dimensions.couplerLength}mm × {part.dimensions.couplerDiameter}mm çap</p>
                            )}
                          </div>
                        )}
                        
                        {part.id === 'tail' && (
                          <div className="text-sm text-orange-200/70">
                            <p>
                              <b>Kanatlar:</b> {part.dimensions.finCount} adet, 
                              {part.dimensions.finShape === 'trapezoidal' ? 'Yamuk' : 
                               part.dimensions.finShape === 'elliptical' ? 'Eliptik' : 
                               part.dimensions.finShape === 'triangular' ? 'Üçgen' : 'Kesilmiş Delta'}, 
                              {part.dimensions.finThickness}mm kalınlık
                            </p>
                            {part.dimensions.rootChord && part.dimensions.tipChord && (
                              <p><b>Boyut:</b> Kök {part.dimensions.rootChord}mm, Uç {part.dimensions.tipChord}mm</p>
                            )}
                            {part.dimensions.height && part.dimensions.sweepLength && (
                              <p><b>Geometri:</b> {part.dimensions.height}mm yükseklik, {part.dimensions.sweepLength}mm süpürme</p>
                            )}
                            {part.dimensions.position && (
                              <p><b>Konum:</b> Gövde ucundan {part.dimensions.position}mm</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {Object.keys(selectedParts).length === 0 && (
                    <p className="text-center text-orange-200/50 py-4">Henüz parça seçilmedi</p>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <div className="mt-6">
                  <button
                    onClick={handleAddToCart}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-md transition-all duration-300 ${
                      Object.keys(selectedParts).length > 0
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={Object.keys(selectedParts).length === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Sepete Ekle
                  </button>
                </div>
              </div>
              {/* Additional Info Boxes */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-black p-6 rounded-lg border border-[rgba(249,115,22,0.2)]">
                  <h3 className="text-xl font-semibold text-orange-400 mb-4">Kalite Standartları</h3>
                  <ul className="space-y-3 text-orange-200/80">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      ISO 9001:2015 Sertifikasyonu
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      AS9100 Havacılık Standardı
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      %100 Kalite Kontrol
                    </li>
                  </ul>
                </div>

                <div className="bg-black p-6 rounded-lg border border-[rgba(249,115,22,0.2)]">
                  <h3 className="text-xl font-semibold text-orange-400 mb-4">Teknik Özellikler</h3>
                  <div className="grid grid-cols-2 gap-4 text-orange-200/80">
                    <div>
                      <div className="text-sm text-orange-400">Malzeme</div>
                      <div>Karbon Fiber / Cam Elyaf</div>
                    </div>
                    <div>
                      <div className="text-sm text-orange-400">Dayanım</div>
                      <div>850+ MPa</div>
                    </div>
                    <div>
                      <div className="text-sm text-orange-400">Sıcaklık Direnci</div>
                      <div>-40°C to +180°C</div>
                    </div>
                    <div>
                      <div className="text-sm text-orange-400">Yüzey İşlemi</div>
                      <div>UV Korumalı</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
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
    </>
  );
};

export default Kompozit; 