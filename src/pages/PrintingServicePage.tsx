import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer as Printer3D, CheckCircle, Upload, Layers, Box, Zap, PaintBucket, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { ModelUploader } from '../components/ModelUploader';
import { ModelViewer } from '../components/ModelViewer';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

// Define material options
const MATERIALS = [
  { id: 'pla', name: 'PLA', description: 'Standard, biodegradable plastic', priceMultiplier: 1.0 },
  { id: 'abs', name: 'ABS', description: 'Durable, heat-resistant plastic', priceMultiplier: 1.2 },
  { id: 'petg', name: 'PETG', description: 'Strong, flexible plastic', priceMultiplier: 1.3 },
  { id: 'tpu', name: 'TPU', description: 'Flexible, rubber-like material', priceMultiplier: 1.5 },
  { id: 'nylon', name: 'Nylon', description: 'Strong, durable material for functional parts', priceMultiplier: 2.0 }
];

// Define layer heights/quality options
const LAYER_HEIGHTS = [
  { id: 'draft', value: 0.3, name: 'Draft Quality (0.3mm)', priceMultiplier: 0.8, timeMultiplier: 0.7 },
  { id: 'standard', value: 0.2, name: 'Standard Quality (0.2mm)', priceMultiplier: 1.0, timeMultiplier: 1.0 },
  { id: 'high', value: 0.1, name: 'High Quality (0.1mm)', priceMultiplier: 1.3, timeMultiplier: 1.5 },
  { id: 'ultra', value: 0.05, name: 'Ultra Quality (0.05mm)', priceMultiplier: 1.8, timeMultiplier: 2.2 }
];

// Define infill options
const INFILL_OPTIONS = [
  { id: 'hollow', value: 0, name: 'Hollow (0%)', priceMultiplier: 0.7, strengthMultiplier: 0.3 },
  { id: 'light', value: 15, name: 'Light (15%)', priceMultiplier: 0.85, strengthMultiplier: 0.6 },
  { id: 'standard', value: 25, name: 'Standard (25%)', priceMultiplier: 1.0, strengthMultiplier: 1.0 },
  { id: 'strong', value: 50, name: 'Strong (50%)', priceMultiplier: 1.3, strengthMultiplier: 1.5 },
  { id: 'solid', value: 100, name: 'Solid (100%)', priceMultiplier: 1.8, strengthMultiplier: 2.0 }
];

// Define color options
const COLOR_OPTIONS = [
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'gray', name: 'Gray', hex: '#808080' },
  { id: 'red', name: 'Red', hex: '#ff0000' },
  { id: 'blue', name: 'Blue', hex: '#0000ff' },
  { id: 'green', name: 'Green', hex: '#00ff00' },
  { id: 'yellow', name: 'Yellow', hex: '#ffff00' },
  { id: 'orange', name: 'Orange', hex: '#ffa500' },
  { id: 'purple', name: 'Purple', hex: '#800080' }
];

export default function PrintingServicePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  
  // State for uploaded model
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelDimensions, setModelDimensions] = useState<{
    width: number;
    height: number;
    depth: number;
    volume: number;
  } | null>(null);
  
  // State for printing options
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0].id);
  const [selectedLayerHeight, setSelectedLayerHeight] = useState(LAYER_HEIGHTS[1].id);
  const [selectedInfill, setSelectedInfill] = useState(INFILL_OPTIONS[2].id);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].id);
  const [quantity, setQuantity] = useState(1);
  const [scale, setScale] = useState(100);
  
  // State for quotes and additional information
  const [notes, setNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  
  // Sample showcase items - replace with your actual images
  const showcaseItems = [
    {
      title: 'Mekanik Parçalar',
      description: 'Hassas toleranslarla üretilmiş fonksiyonel mekanik parçalar',
      image: '/images/3d-printing/mechanical-parts.gif',
      alt: '3D Baskılı Mekanik Parçalar'
    },
    {
      title: 'Prototip Modeller',
      description: 'Fikrinizi hızlıca hayata geçirin',
      image: '/images/3d-printing/prototype.gif',
      alt: 'Prototip Modelleri'
    },
    {
      title: 'Artistik Tasarımlar',
      description: 'Yaratıcı fikirlerinizi somutlaştırın',
      image: '/images/3d-printing/artistic-designs.gif',
      alt: 'Artistik 3D Baskı Tasarımları'
    },
    {
      title: 'Özelleştirilmiş Ürünler',
      description: 'Kendi tasarımınızı hayata geçirin',
      image: '/images/3d-printing/custom-products.gif',
      alt: 'Özelleştirilmiş 3D Baskı Ürünleri'
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleOnHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  // Calculate estimated price and time whenever relevant values change
  useEffect(() => {
    if (!modelDimensions) return;
    
    // Get multipliers from selected options
    const material = MATERIALS.find(m => m.id === selectedMaterial);
    const layerHeight = LAYER_HEIGHTS.find(l => l.id === selectedLayerHeight);
    const infill = INFILL_OPTIONS.find(i => i.id === selectedInfill);
    
    if (!material || !layerHeight || !infill) return;
    
    // Calculate volume in cm³ (adjusted for scale and infill)
    const scaleFactor = scale / 100;
    const adjustedVolume = modelDimensions.volume * (scaleFactor ** 3) * (infill.value / 100);
    
    // Base price calculation (₺100 per 100cm³ as a starting point)
    const basePrice = (adjustedVolume / 100) * 100;
    
    // Apply multipliers
    const price = basePrice * material.priceMultiplier * layerHeight.priceMultiplier * infill.priceMultiplier;
    
    // Calculate total with quantity
    const total = price * quantity;
    
    setEstimatedPrice(Math.max(50, Math.round(total))); // Minimum price of ₺50
    
    // Calculate estimated time (simplified)
    const baseHours = (adjustedVolume / 20); // Base: 20cm³ per hour
    const adjustedHours = baseHours * layerHeight.timeMultiplier;
    
    // Format time estimate
    if (adjustedHours < 1) {
      setEstimatedTime(`${Math.round(adjustedHours * 60)} dakika`);
    } else if (adjustedHours < 24) {
      const hours = Math.floor(adjustedHours);
      const minutes = Math.round((adjustedHours - hours) * 60);
      setEstimatedTime(`${hours} saat${minutes > 0 ? ` ${minutes} dakika` : ''}`);
    } else {
      const days = Math.floor(adjustedHours / 24);
      const hours = Math.round(adjustedHours % 24);
      setEstimatedTime(`${days} gün${hours > 0 ? ` ${hours} saat` : ''}`);
    }
    
  }, [modelDimensions, selectedMaterial, selectedLayerHeight, selectedInfill, scale, quantity]);
  
  const handleModelUpload = (file: File, dimensions: Record<string, number>) => {
    setModelFile(file);
    
    // Create URL for the model
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    
    // Fixed TypeScript error: Cast the Record to the expected shape
    setModelDimensions({
      width: dimensions.width || 0,
      height: dimensions.height || 0,
      depth: dimensions.depth || 0,
      volume: dimensions.volume || 0
    });
  };
  
  const handleAddToCart = () => {
    if (!modelFile || !modelDimensions || !estimatedPrice) {
      showNotification('error', 'Lütfen önce bir model yükleyin');
      return;
    }
    
    // Get name of selected options
    const materialName = MATERIALS.find(m => m.id === selectedMaterial)?.name;
    const layerHeightName = LAYER_HEIGHTS.find(l => l.id === selectedLayerHeight)?.name;
    const infillName = INFILL_OPTIONS.find(i => i.id === selectedInfill)?.name;
    const colorName = COLOR_OPTIONS.find(c => c.id === selectedColor)?.name;
    
    // Create custom product for cart
    const customPrintProduct = {
      productId: `custom-print-${Date.now()}`,
      name: `Özel 3D Baskı: ${modelFile.name}`,
      price: estimatedPrice,
      image: '/images/3d-printing.jpg', // Default image for 3D printing service
      quantity: quantity,
      customData: {
        type: '3d-print',
        fileName: modelFile.name,
        dimensions: modelDimensions,
        options: {
          material: { id: selectedMaterial, name: materialName },
          layerHeight: { id: selectedLayerHeight, name: layerHeightName },
          infill: { id: selectedInfill, name: infillName },
          color: { id: selectedColor, name: colorName },
          scale: scale,
          notes: notes
        }
      }
    };
    
    addToCart(customPrintProduct);
    showNotification('cart', 'Özel baskı talebi sepete eklendi!');
  };
  
  const handleRequestQuote = () => {
    if (!modelFile || !modelDimensions) {
      showNotification('error', 'Lütfen önce bir model yükleyin');
      return;
    }
    
    // Get name of selected options
    const materialName = MATERIALS.find(m => m.id === selectedMaterial)?.name;
    const layerHeightName = LAYER_HEIGHTS.find(l => l.id === selectedLayerHeight)?.name;
    const infillName = INFILL_OPTIONS.find(i => i.id === selectedInfill)?.name;
    const colorName = COLOR_OPTIONS.find(c => c.id === selectedColor)?.name;
    
    // Create custom product for cart
    const customPrintProduct = {
      productId: `custom-print-${Date.now()}`,
      name: `Özel 3D Baskı: ${modelFile.name}`,
      price: estimatedPrice || 0,
      image: '/images/3d-printing.jpg', // Default image for 3D printing service
      quantity: quantity,
      customData: {
        type: '3d-print',
        fileName: modelFile.name,
        dimensions: modelDimensions,
        options: {
          material: { id: selectedMaterial, name: materialName },
          layerHeight: { id: selectedLayerHeight, name: layerHeightName },
          infill: { id: selectedInfill, name: infillName },
          color: { id: selectedColor, name: colorName },
          scale: scale,
          notes: notes
        }
      }
    };
    
    addToCart(customPrintProduct);
    navigate('/cart');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.imgur.com/7xB5nob.jpeg" 
            alt="3D Printing Hero"
            className="absolute w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-background z-10" />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.h1 
              className="text-6xl md:text-7xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block">Hayallerinizi</span>{" "}
              <span className="text-primary inline-block">Somutlaştırın</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-200 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Premium 3D baskı hizmetleri ile fikirlerinizi gerçeğe dönüştürün.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.button
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all text-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="mr-2 h-5 w-5" />
                Model Yükle
              </motion.button>
              
              <motion.button
                className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-all text-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Printer3D className="mr-2 h-5 w-5" />
                Üretimlerimiz
              </motion.button>
            </motion.div>
          </motion.div>
      </div>
      
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop" 
          }}
        >
          <div className="block">
            <div className="w-8 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <motion.div 
                className="w-1.5 h-3 bg-white rounded-full"
                animate={{ y: [0, 5, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop" 
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Premium Showcase Carousel */}
      <section 
        id="showcase" 
        className="py-24 bg-gradient-to-b from-background to-accent/5"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              3D Baskı Teknolojisi
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Yüksek Hassasiyetli Üretim
            </motion.h2>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              En gelişmiş 3D baskı teknolojileri ile detaylı ve dayanıklı parçalar üretiyoruz.
            </motion.p>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl relative">
                <img 
                  src="../../public/0519.gif" 
                  alt="3D Printing Process" 
                  className="w-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg text-primary font-medium">
                  Üretim Süreci
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 space-y-8"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="bg-accent/30 rounded-xl p-6 backdrop-blur-sm border border-primary/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mr-3">
                    <Layers className="h-5 w-5" />
                  </div>
                  Mikron Hassasiyet
                </h3>
                <p className="text-gray-400">
                  0.05mm katman kalınlığı ile en karmaşık geometrileri bile hassasiyetle üreterek detaylı modellerinizi hayata geçiriyoruz.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-accent/30 rounded-xl p-6 backdrop-blur-sm border border-primary/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mr-3">
                    <Box className="h-5 w-5" />
                  </div>
                  Endüstriyel Malzemeler
                </h3>
                <p className="text-gray-400">
                  PLA, ABS, PETG  ve TPU  gibi yüksek performanslı malzemelerle fonksiyonel parçalar üretiyoruz.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-accent/30 rounded-xl p-6 backdrop-blur-sm border border-primary/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mr-3">
                    <Zap className="h-5 w-5" />
                  </div>
                  Hızlı Prototipleme
                </h3>
                <p className="text-gray-400">
                  Fikirden prototipe: Acil projeleriniz için 24 saat içinde üretim imkanı ile ürün geliştirme süreçlerinizi hızlandırın.
                </p>
              </motion.div>
              
              <motion.button
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg w-full shadow-lg shadow-primary/20 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Printer3D className="h-5 w-5 mr-2" />
                Tüm Özelliklerimizi Keşfedin
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Premium Upload & Configure Section */}
      <section id="upload-model" className="py-24 relative bg-gradient-to-b from-accent/5 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Kişiselleştirilmiş Üretim
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              3D Modelinizi Yükleyin
            </motion.h2>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              STL, OBJ veya 3MF formatındaki modelinizi yükleyin, seçenekleri belirleyin ve siparişinizi oluşturun.
            </motion.p>
          </motion.div>
          
          <div className="flex flex-wrap -mx-4">
            {/* Left Column - Model Upload & Preview */}
            <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
              <motion.div 
                className="bg-accent rounded-2xl shadow-xl overflow-hidden h-full"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="p-8 md:p-10 bg-primary/5 border-b border-primary/10">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Upload className="h-6 w-6 mr-2 text-primary" />
                    Model Yükleme
                  </h3>
                </div>
                
                <div className="p-8 md:p-10">
                  <div className="mb-8">
                    <p className="text-gray-400 mb-6">
                      STL, OBJ veya 3MF formatındaki 3D modelinizi yükleyin. Dosya boyutu maksimum 50MB olmalıdır.
                    </p>
                    
                    <ModelUploader onModelUpload={handleModelUpload} />
                  </div>
                  
                  {/* Model Dimensions */}
                  {modelDimensions && (
                    <motion.div 
                      className="mt-8 bg-background p-6 rounded-xl border border-primary/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="font-bold mb-4 flex items-center">
                        <Box className="h-5 w-5 mr-2 text-primary" />
                        Model Boyutları
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="rounded-lg bg-accent/50 p-4">
                          <p className="text-sm text-gray-400 mb-1">Genişlik</p>
                          <p className="font-medium text-lg">{(modelDimensions.width * scale / 100).toFixed(2)} mm</p>
                        </div>
                        <div className="rounded-lg bg-accent/50 p-4">
                          <p className="text-sm text-gray-400 mb-1">Yükseklik</p>
                          <p className="font-medium text-lg">{(modelDimensions.height * scale / 100).toFixed(2)} mm</p>
                        </div>
                        <div className="rounded-lg bg-accent/50 p-4">
                          <p className="text-sm text-gray-400 mb-1">Derinlik</p>
                          <p className="font-medium text-lg">{(modelDimensions.depth * scale / 100).toFixed(2)} mm</p>
                        </div>
                        <div className="rounded-lg bg-accent/50 p-4">
                          <p className="text-sm text-gray-400 mb-1">Hacim</p>
                          <p className="font-medium text-lg">{((modelDimensions.volume * (scale / 100) ** 3) / 1000).toFixed(2)} cm³</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label htmlFor="scale" className="block text-sm font-medium mb-2 flex justify-between">
                          <span>Ölçeklendirme</span>
                          <span className="text-primary">{scale}%</span>
                        </label>
                        <input
                          id="scale"
                          type="range"
                          min="10"
                          max="200"
                          value={scale}
                          onChange={(e) => setScale(parseInt(e.target.value))}
                          className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>10%</span>
                          <span>100%</span>
                          <span>200%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Model Viewer */}
                  {modelUrl && (
                    <motion.div 
                      className="mt-8 bg-background/50 p-6 rounded-xl border border-primary/10 aspect-square relative overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                      <ModelViewer modelUrl={modelUrl} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Right Column - Configuration Options */}
            <div className="w-full lg:w-1/2 px-4">
              <motion.div 
                className="bg-accent rounded-2xl shadow-xl overflow-hidden h-full"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="p-8 md:p-10 bg-primary/5 border-b border-primary/10">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Layers className="h-6 w-6 mr-2 text-primary" />
                    Baskı Seçenekleri
                  </h3>
                </div>
                
                <div className="p-8 md:p-10 space-y-8 max-h-[800px] overflow-y-auto custom-scrollbar">
                  {/* Material Selection */}
                  <div>
                    <h4 className="font-bold mb-4 flex items-center text-lg">
                      <Box className="h-5 w-5 text-primary mr-2" />
                      Malzeme Seçimi
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {MATERIALS.map((material, index) => (
                        <motion.div
                          key={material.id}
                          className={`border border-accent-foreground/10 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedMaterial === material.id 
                              ? 'bg-primary/10 border-primary shadow-md shadow-primary/5' 
                              : 'hover:bg-accent-foreground/5 hover:border-accent-foreground/20'
                          }`}
                          onClick={() => setSelectedMaterial(material.id)}
                          whileHover={{ y: -5 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              selectedMaterial === material.id ? 'border-primary' : 'border-gray-400'
                            }`}>
                              {selectedMaterial === material.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{material.name}</p>
                              <p className="text-xs text-gray-400 mt-1">{material.description}</p>
                            </div>
                          </div>
                          {selectedMaterial === material.id && (
                            <motion.div 
                              className="w-full h-0.5 bg-primary/30 mt-3"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quality/Layer Height */}
                  <div>
                    <h4 className="font-bold mb-4 flex items-center text-lg">
                      <Layers className="h-5 w-5 text-primary mr-2" />
                      Baskı Kalitesi
                    </h4>
                    
                    <div className="space-y-3">
                      {LAYER_HEIGHTS.map((layer, index) => (
                        <motion.div
                          key={layer.id}
                          className={`border border-accent-foreground/10 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedLayerHeight === layer.id 
                              ? 'bg-primary/10 border-primary shadow-md shadow-primary/5' 
                              : 'hover:bg-accent-foreground/5 hover:border-accent-foreground/20'
                          }`}
                          onClick={() => setSelectedLayerHeight(layer.id)}
                          whileHover={{ y: -5 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              selectedLayerHeight === layer.id ? 'border-primary' : 'border-gray-400'
                            }`}>
                              {selectedLayerHeight === layer.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">{layer.name}</p>
                                <p className="text-sm ml-4">
                                  {layer.id === 'draft' && <span className="text-green-500">-20%</span>}
                                  {layer.id === 'standard' && <span>Standart</span>}
                                  {layer.id === 'high' && <span className="text-amber-500">+30%</span>}
                                  {layer.id === 'ultra' && <span className="text-primary">+80%</span>}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {layer.id === 'draft' && 'Hızlı baskı, daha görünür katmanlar'}
                                {layer.id === 'standard' && 'En iyi hız/kalite dengesi'}
                                {layer.id === 'high' && 'Daha pürüzsüz yüzeyler, uzun baskı süresi'}
                                {layer.id === 'ultra' && 'En yüksek detay, en uzun baskı süresi'}
                              </p>
                            </div>
                          </div>
                          {selectedLayerHeight === layer.id && (
                            <motion.div 
                              className="w-full h-0.5 bg-primary/30 mt-3"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Infill Options */}
                  <div>
                    <h4 className="font-bold mb-4 flex items-center text-lg">
                      <Box className="h-5 w-5 text-primary mr-2" />
                      Dolgu Yoğunluğu
                    </h4>
                    
                    <div className="space-y-3">
                      {INFILL_OPTIONS.map((infill, index) => (
                        <motion.div
                          key={infill.id}
                          className={`border border-accent-foreground/10 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedInfill === infill.id 
                              ? 'bg-primary/10 border-primary shadow-md shadow-primary/5' 
                              : 'hover:bg-accent-foreground/5 hover:border-accent-foreground/20'
                          }`}
                          onClick={() => setSelectedInfill(infill.id)}
                          whileHover={{ y: -5 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              selectedInfill === infill.id ? 'border-primary' : 'border-gray-400'
                            }`}>
                              {selectedInfill === infill.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">{infill.name}</p>
                                <p className="text-sm ml-4">
                                  {infill.id === 'hollow' && <span className="text-green-500">-30%</span>}
                                  {infill.id === 'light' && <span className="text-green-500">-15%</span>}
                                  {infill.id === 'standard' && <span>Standart</span>}
                                  {infill.id === 'strong' && <span className="text-amber-500">+30%</span>}
                                  {infill.id === 'solid' && <span className="text-primary">+80%</span>}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {infill.id === 'hollow' && 'Sadece dış kabuk, düşük dayanıklılık'}
                                {infill.id === 'light' && 'Az dolgu, yeterli dayanıklılık'}
                                {infill.id === 'standard' && 'Dengeli dolgu ve dayanıklılık'}
                                {infill.id === 'strong' && 'Yüksek dolgu ve dayanıklılık'}
                                {infill.id === 'solid' && 'Tamamen dolu, maksimum dayanıklılık'}
                              </p>
                            </div>
                          </div>
                          {selectedInfill === infill.id && (
                            <motion.div 
                              className="w-full h-0.5 bg-primary/30 mt-3"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  <div>
                    <h4 className="font-bold mb-4 flex items-center text-lg">
                      <PaintBucket className="h-5 w-5 text-primary mr-2" />
                      Renk Seçimi
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {COLOR_OPTIONS.map((color) => (
                        <motion.div
                          key={color.id}
                          className={`border border-accent-foreground/10 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center ${
                            selectedColor === color.id 
                              ? 'bg-primary/10 border-primary shadow-md shadow-primary/5' 
                              : 'hover:bg-accent-foreground/5 hover:border-accent-foreground/20'
                          }`}
                          onClick={() => setSelectedColor(color.id)}
                          whileHover={{ y: -5 }}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full mb-2" 
                            style={{ 
                              backgroundColor: color.hex,
                              border: color.id === 'white' ? '1px solid #ddd' : 'none',
                            }}
                          />
                          <p className="text-sm font-medium">{color.name}</p>
                          {selectedColor === color.id && (
                            <motion.div 
                              className="w-full h-0.5 bg-primary/30 mt-2"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Other Options... */}
                  
                  {/* Estimate and Action Buttons */}
                  {modelDimensions && estimatedPrice && (
                    <motion.div 
                      className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <div>
                          <p className="text-sm text-primary font-medium mb-1">Tahmini Fiyat:</p>
                          <p className="text-3xl font-bold">{estimatedPrice.toLocaleString('tr-TR')} ₺</p>
                        </div>
                        
                        <div className="mt-4 md:mt-0 bg-background/50 p-3 rounded-lg">
                          <p className="text-sm text-primary font-medium mb-1">Tahmini Baskı Süresi:</p>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-primary mr-2" />
                            <p className="font-medium">{estimatedTime}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 mb-6 bg-background/50 p-3 rounded-lg">
                        * Bu fiyat tahminidir ve kesin fiyat parçanın karmaşıklığına ve diğer faktörlere göre değişebilir.
                        Kesin fiyat için teklif talebinde bulunun.
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <motion.button
                          onClick={handleAddToCart}
                          className="flex-1 bg-accent hover:bg-accent/70 text-foreground py-4 rounded-lg transition-all flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Sepete Ekle
                        </motion.button>
                        <motion.button
                          onClick={handleRequestQuote}
                          className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground py-4 rounded-lg transition-all flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Teklif İste
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Premium Service Features */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap">
            <motion.div 
              className="w-full md:w-5/12 px-4 mb-16 md:mb-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.8 } }
              }}
            >
              <motion.span
                className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Neden Biz?
              </motion.span>
              
              <motion.h2 
                className="text-4xl font-bold mb-6"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
                }}
              >
                Endüstri Lideri 3D <br/>
                <span className="text-primary">Baskı Hizmetleri</span>
              </motion.h2>
              
              <motion.div 
                className="w-20 h-1 bg-primary mb-8"
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              
              <motion.p 
                className="text-lg leading-relaxed mb-8 text-gray-400"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } }
                }}
              >
                Uzinovas'ın 3D baskı hizmeti, en son teknoloji ekipmanlar ve uzman kadromuzla benzersiz bir deneyim sunuyor. Prototiplerden fonksiyonel parçalara, sanatsal tasarımlardan özel projelere kadar tüm ihtiyaçlarınızı karşılıyoruz.
              </motion.p>
              
              <motion.p 
                className="text-lg leading-relaxed mb-10 text-gray-400"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5 } }
                }}
              >
                Geniş malzeme yelpazesi, hassas üretim kabiliyeti ve hızlı teslimat seçenekleriyle projelerinizi hayata geçiriyoruz.
              </motion.p>
              
              <motion.div 
                className="flex items-center space-x-4"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.6 } }
                }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Kalite Garantisi</h4>
                  <p className="text-gray-400">Her baskıda profesyonel kalite</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-6/12 md:ml-auto md:pl-8"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: {
                    delayChildren: 0.3,
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div 
                  className="bg-accent rounded-2xl p-8 relative overflow-hidden group"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-125"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Printer3D className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Mikron Hassasiyet</h3>
                    <p className="text-gray-400">0.05mm'ye kadar hassasiyet ile kompleks ve detaylı modeller basabiliyoruz.</p>
                    <div className="absolute bottom-0 right-0 p-6 opacity-10">
                      <Printer3D className="h-24 w-24 text-primary" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-accent rounded-2xl p-8 relative overflow-hidden group"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-125"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Ekspres Teslimat</h3>
                    <p className="text-gray-400">Acil projeleriniz için 24 saat içinde üretim ve teslimat seçeneği.</p>
                    <div className="absolute bottom-0 right-0 p-6 opacity-10">
                      <Zap className="h-24 w-24 text-primary" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-accent rounded-2xl p-8 relative overflow-hidden group"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-125"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Box className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Premium Malzemeler</h3>
                    <p className="text-gray-400">Endüstriyel kalitede PLA, ABS, PETG, TPU, Nylon ve daha fazlası.</p>
                    <div className="absolute bottom-0 right-0 p-6 opacity-10">
                      <Box className="h-24 w-24 text-primary" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-accent rounded-2xl p-8 relative overflow-hidden group"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-125"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <PaintBucket className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Zengin Renk Paleti</h3>
                    <p className="text-gray-400">Özel renk seçenekleriyle projelerinizi tam istediğiniz gibi hayata geçirin.</p>
                    <div className="absolute bottom-0 right-0 p-6 opacity-10">
                      <PaintBucket className="h-24 w-24 text-primary" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Premium Process Section */}
      <section className="py-24 bg-accent/5 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Nasıl Çalışır?
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Basit 4 Adımda <span className="text-primary">3D Baskı</span>
            </motion.h2>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Fikrinizden bitmiş ürüne: 3D baskı sürecimiz zahmetsiz ve verimlidir.
            </motion.p>
          </motion.div>
          
          <div className="relative">
            {/* Process Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-200/20 -translate-y-1/2 rounded-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="bg-accent rounded-2xl p-8 shadow-xl h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-300 group-hover:scale-150"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                        whileHover={{ rotate: 5 }}
                      >
                        1
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Modeli Yükle</h3>
                    <p className="text-gray-400">
                      STL, OBJ veya 3MF formatındaki 3D modelinizi sistemimize yükleyin ve önizleyin.
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <Upload className="h-24 w-24 text-primary" />
                  </div>
                </div>
                
                <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full items-center justify-center z-20">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-accent rounded-2xl p-8 shadow-xl h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-300 group-hover:scale-150"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                        whileHover={{ rotate: 5 }}
                      >
                        2
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Ayarları Seçin</h3>
                    <p className="text-gray-400">
                      Malzeme, kalite, renk ve diğer parametreleri ihtiyacınıza göre özelleştirin.
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <Layers className="h-24 w-24 text-primary" />
                  </div>
                </div>
                
                <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full items-center justify-center z-20">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-accent rounded-2xl p-8 shadow-xl h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-300 group-hover:scale-150"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                        whileHover={{ rotate: 5 }}
                      >
                        3
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Siparişi Verin</h3>
                    <p className="text-gray-400">
                      Seçeneklerinizi onaylayın, sepete ekleyin ve siparişinizi oluşturun.
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <CheckCircle className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-accent rounded-2xl p-8 shadow-xl h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-300 group-hover:scale-150"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                        whileHover={{ rotate: 5 }}
                      >
                        4
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Teslim Alın</h3>
                    <p className="text-gray-400">
                      Modeliniz üretildikten sonra adresinize teslim edilir veya mağazadan alabilirsiniz.
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <Box className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Premium FAQ Section */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Sorularınız mı var?
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Sıkça Sorulan Sorular
            </motion.h2>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              3D baskı hizmetlerimiz hakkında en çok sorulan sorular ve cevapları.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-accent rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Hangi dosya formatlarını yükleyebilirim?</h4>
                <p className="text-gray-400">
                  Sistemimiz STL, OBJ ve 3MF formatındaki 3D model dosyalarını desteklemektedir. Maksimum dosya boyutu 50MB'dır.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-accent rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Baskı süresi ne kadar?</h4>
                <p className="text-gray-400">
                  Baskı süresi modelin boyutuna, karmaşıklığına ve seçilen kaliteye göre değişir. Küçük bir model birkaç saat sürerken, büyük ve detaylı modeller günler sürebilir. Her sipariş için size özel bir zaman tahmini sunuyoruz.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-accent rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Maksimum baskı boyutu nedir?</h4>
                <p className="text-gray-400">
                  Premium yazıcılarımızda maksimum 250mm x 250mm x 300mm boyutunda baskı yapabiliyoruz. Daha büyük modeller için parçalara ayırma ve sonradan birleştirme hizmeti de sunmaktayız.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-accent rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Fiyatlandırma nasıl hesaplanıyor?</h4>
                <p className="text-gray-400">
                  Fiyatlar modelin hacmi, seçilen malzeme, kalite ve dolgu yoğunluğuna göre hesaplanır. Sistem otomatik olarak tahmini bir fiyat sunar, karmaşık modeller için uzman ekibimiz ek değerlendirme yapabilir.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-accent rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Teslimat seçenekleri nelerdir?</h4>
                <p className="text-gray-400">
                  Standart teslimat 2-7 iş günü içerisindedir. Acil işleriniz için ekspres teslimat seçeneğimiz de bulunmaktadır. Ayrıca ürünlerinizi şubelerimizden teslim alma imkanı da sunuyoruz.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-accent rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Özel malzeme talepleri yapabilir miyim?</h4>
                <p className="text-gray-400">
                  Evet, standart ürün listemizde bulunmayan özel malzeme taleplerini değerlendiriyoruz. Lütfen özel isteklerinizi sipariş notlarına ekleyin veya bizimle doğrudan iletişime geçin.
                </p>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-gray-400 mb-6">Başka sorularınız mı var? Ekibimizle iletişime geçin.</p>
            <motion.button
              className="px-8 py-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg inline-flex items-center transition-colors font-medium"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              İletişime Geçin <ChevronRight className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
