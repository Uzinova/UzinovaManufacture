import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer as Printer3D, CheckCircle   , Upload, YoutubeIcon as CubeIcon, LayoutGrid, Layers, Box, Zap, PaintBucket, Clock    } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ModelUploader } from '../components/ModelUploader';
import { ModelViewer } from '../components/ModelViewer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
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
  const { currentUser } = useAuth();
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
  
  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleModelUpload = (file: File, dimensions: any) => {
    setModelFile(file);
    
    // Create URL for the model
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    
    // Set dimensions
    setModelDimensions(dimensions);
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-16 pb-32 flex content-center items-center justify-center">
        <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1619123707243-11955c8eaff7?auto=format&fit=crop&q=80&w=2274')"
        }}>
          <span className="w-full h-full absolute opacity-75 bg-black"></span>
        </div>
        <div className="container relative mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap justify-center">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div>
                <h1 className="text-white font-semibold text-5xl mb-4">
                  3D Baskı Hizmetleri
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                  Hayalinizdeki tasarımları gerçeğe dönüştürün. Yüksek kaliteli malzemeler ve profesyonel ekipmanlarla özel 3D baskı çözümleri sunuyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Service Introduction */}
          <div className="flex flex-wrap items-center mb-16">
            <div className="w-full md:w-5/12 px-4 mr-auto ml-auto">
              <h3 className="text-3xl font-bold mb-2">
                Profesyonel 3D Baskı Çözümleri
              </h3>
              <p className="text-lg leading-relaxed mt-4 mb-4 text-gray-400">
                Uzinovas'ın 3D baskı hizmeti ile prototiplerden fonksiyonel parçalara, dekoratif öğelerden özel projelere kadar tüm ihtiyaçlarınızı karşılıyoruz.
              </p>
              <p className="text-lg leading-relaxed mt-0 mb-4 text-gray-400">
                Yüksek hassasiyetli ekipmanlarımız ve geniş malzeme seçeneklerimizle hayallerinizi gerçeğe dönüştürüyoruz.
              </p>
            </div>
            
            <div className="w-full md:w-6/12 px-4 mr-auto ml-auto mt-8 md:mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent rounded-lg p-6">
                  <Printer3D className="h-10 w-10 text-primary mb-3" />
                  <h5 className="text-xl font-bold">Hassas Üretim</h5>
                  <p className="mt-2 text-gray-400">0.05mm'ye kadar hassasiyet ile yüksek detaylı modeller.</p>
                </div>
                <div className="bg-accent rounded-lg p-6">
                  <Zap className="h-10 w-10 text-primary mb-3" />
                  <h5 className="text-xl font-bold">Hızlı Teslimat</h5>
                  <p className="mt-2 text-gray-400">Birçok projede 24 saat içinde üretim ve teslimat.</p>
                </div>
                <div className="bg-accent rounded-lg p-6">
                  <Box className="h-10 w-10 text-primary mb-3" />
                  <h5 className="text-xl font-bold">Çeşitli Malzemeler</h5>
                  <p className="mt-2 text-gray-400">PLA, ABS, PETG, TPU, Nylon ve daha fazlası.</p>
                </div>
                <div className="bg-accent rounded-lg p-6">
                  <PaintBucket className="h-10 w-10 text-primary mb-3" />
                  <h5 className="text-xl font-bold">Geniş Renk Seçenekleri</h5>
                  <p className="mt-2 text-gray-400">Projenize uygun çeşitli renk alternatifleri.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upload & Model Viewer Section */}
          <div className="flex flex-wrap items-start">
            <div className="w-full lg:w-6/12 px-4 mb-12 lg:mb-0">
              <div className="bg-accent rounded-lg p-6 sticky top-24">
                <h3 className="text-2xl font-bold mb-4">Model Yükle</h3>
                <p className="text-gray-400 mb-6">
                  STL, OBJ veya 3MF formatındaki 3D modelinizi yükleyin. Dosya boyutu maksimum 50MB olmalıdır.
                </p>
                
                <ModelUploader onModelUpload={handleModelUpload} />
                
                {modelDimensions && (
                  <div className="mt-6 bg-background p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Model Boyutları</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Genişlik</p>
                        <p className="font-medium">{(modelDimensions.width * scale / 100).toFixed(2)} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Yükseklik</p>
                        <p className="font-medium">{(modelDimensions.height * scale / 100).toFixed(2)} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Derinlik</p>
                        <p className="font-medium">{(modelDimensions.depth * scale / 100).toFixed(2)} mm</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Hacim</p>
                        <p className="font-medium">{((modelDimensions.volume * (scale / 100) ** 3) / 1000).toFixed(2)} cm³</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="scale" className="block text-sm font-medium mb-1">Ölçeklendirme (%)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="scale"
                          type="range"
                          min="10"
                          max="200"
                          value={scale}
                          onChange={(e) => setScale(parseInt(e.target.value))}
                          className="w-full bg-background rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="w-12 text-center">{scale}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Model Viewer */}
                {modelUrl && (
                  <div className="mt-6 bg-background p-4 rounded-lg aspect-square">
                    <ModelViewer modelUrl={modelUrl} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full lg:w-6/12 px-4">
              <h3 className="text-2xl font-bold mb-4">Baskı Seçenekleri</h3>
              <p className="text-gray-400 mb-6">
                Modelinizin nasıl basılacağını belirleyin. Seçtiğiniz her opsiyon fiyatı ve üretim süresini etkileyecektir.
              </p>
              
              <div className="space-y-6">
                {/* Material Selection */}
                <div className="bg-accent rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Box className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-bold">Malzeme Seçimi</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MATERIALS.map(material => (
                      <div
                        key={material.id}
                        className={`border border-accent-foreground/20 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedMaterial === material.id 
                            ? 'bg-primary/20 border-primary' 
                            : 'hover:bg-accent-foreground/5'
                        }`}
                        onClick={() => setSelectedMaterial(material.id)}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedMaterial === material.id ? 'border-primary' : 'border-gray-400'
                          }`}>
                            {selectedMaterial === material.id && (
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-xs text-gray-400">{material.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quality/Layer Height */}
                <div className="bg-accent rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Layers className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-bold">Baskı Kalitesi</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {LAYER_HEIGHTS.map(layer => (
                      <div
                        key={layer.id}
                        className={`border border-accent-foreground/20 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedLayerHeight === layer.id 
                            ? 'bg-primary/20 border-primary' 
                            : 'hover:bg-accent-foreground/5'
                        }`}
                        onClick={() => setSelectedLayerHeight(layer.id)}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedLayerHeight === layer.id ? 'border-primary' : 'border-gray-400'
                          }`}>
                            {selectedLayerHeight === layer.id && (
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{layer.name}</p>
                            <p className="text-xs text-gray-400">
                              {layer.id === 'draft' && 'Hızlı baskı, daha görünür katmanlar'}
                              {layer.id === 'standard' && 'En iyi hız/kalite dengesi'}
                              {layer.id === 'high' && 'Daha pürüzsüz yüzeyler, uzun baskı süresi'}
                              {layer.id === 'ultra' && 'En yüksek detay, en uzun baskı süresi'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {layer.id === 'draft' && '-20%'}
                            {layer.id === 'standard' && 'Baz fiyat'}
                            {layer.id === 'high' && '+30%'}
                            {layer.id === 'ultra' && '+80%'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Infill Options */}
                <div className="bg-accent rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <LayoutGrid className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-bold">Dolgu Yoğunluğu</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {INFILL_OPTIONS.map(infill => (
                      <div
                        key={infill.id}
                        className={`border border-accent-foreground/20 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedInfill === infill.id 
                            ? 'bg-primary/20 border-primary' 
                            : 'hover:bg-accent-foreground/5'
                        }`}
                        onClick={() => setSelectedInfill(infill.id)}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedInfill === infill.id ? 'border-primary' : 'border-gray-400'
                          }`}>
                            {selectedInfill === infill.id && (
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{infill.name}</p>
                            <div className="w-full bg-background rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${infill.value}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {infill.id === 'hollow' && 'Dekoratif'}
                            {infill.id === 'light' && 'Hafif'}
                            {infill.id === 'standard' && 'Genel kullanım'}
                            {infill.id === 'strong' && 'Dayanıklı'}
                            {infill.id === 'solid' && 'Maksimum'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Color Selection */}
                <div className="bg-accent rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <PaintBucket className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-bold">Renk Seçimi</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {COLOR_OPTIONS.map(color => (
                      <div
                        key={color.id}
                        className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedColor === color.id 
                            ? 'bg-primary/20 border border-primary' 
                            : 'hover:bg-accent-foreground/5'
                        }`}
                        onClick={() => setSelectedColor(color.id)}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border border-accent-foreground/30 mb-1"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="text-xs">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quantity Selection */}
                <div className="bg-accent rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CubeIcon className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-bold">Adet</h4>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-l-lg bg-background flex items-center justify-center hover:bg-background/70 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-10 bg-background text-center border-x border-accent-foreground/10 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-r-lg bg-background flex items-center justify-center hover:bg-background/70 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Additional Notes */}
                <div className="bg-accent rounded-lg p-6">
                  <h4 className="font-bold mb-4">Ek Notlar</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Özel istekleriniz veya detaylar..."
                    className="w-full bg-background rounded-lg p-3 min-h-[100px] resize-none"
                  ></textarea>
                </div>
                
                {/* Estimate and Action Buttons */}
                {modelDimensions && estimatedPrice && (
                  <div className="bg-primary/10 rounded-lg p-6 border border-primary/30">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                      <div>
                        <p className="text-sm text-primary">Tahmini Fiyat:</p>
                        <p className="text-2xl font-bold">{estimatedPrice.toLocaleString('tr-TR')} ₺</p>
                      </div>
                      
                      <div className="mt-2 md:mt-0">
                        <p className="text-sm text-primary">Tahmini Baskı Süresi:</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-primary mr-1" />
                          <p>{estimatedTime}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-4">
                      * Bu fiyat tahminidir ve kesin fiyat parçanın karmaşıklığına ve diğer faktörlere göre değişebilir.
                      Kesin fiyat için teklif talebinde bulunun.
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-accent hover:bg-accent/70 text-foreground px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Sepete Ekle
                      </button>
                      <button
                        onClick={handleRequestQuote}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Teklif İste
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Process Explanation */}
          <div className="mt-24">
            <h3 className="text-3xl font-bold mb-8 text-center">3D Baskı Süreci</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-accent rounded-lg p-6 relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">1</div>
                <h4 className="text-xl font-bold mb-2">Modeli Yükle</h4>
                <p className="text-gray-400">
                  STL, OBJ veya 3MF formatındaki 3D modelinizi yükleyin ve görüntüleyin.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6 relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">2</div>
                <h4 className="text-xl font-bold mb-2">Ayarları Seçin</h4>
                <p className="text-gray-400">
                  Malzeme, kalite, renk gibi baskı parametrelerini belirleyin.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6 relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">3</div>
                <h4 className="text-xl font-bold mb-2">Siparişi Verin</h4>
                <p className="text-gray-400">
                  Seçeneklerinizi tamamlayıp sepete ekleyerek siparişinizi oluşturun.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6 relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">4</div>
                <h4 className="text-xl font-bold mb-2">Teslim Alın</h4>
                <p className="text-gray-400">
                  Baskı işlemi tamamlandıktan sonra ürününüz adresinize teslim edilir.
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-24">
            <h3 className="text-3xl font-bold mb-8 text-center">Sıkça Sorulan Sorular</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-accent rounded-lg p-6">
                <h4 className="font-bold mb-2">Hangi dosya formatlarını yükleyebilirim?</h4>
                <p className="text-gray-400">
                  STL, OBJ ve 3MF formatındaki 3D model dosyalarını yükleyebilirsiniz.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6">
                <h4 className="font-bold mb-2">Baskı süresi ne kadar?</h4>
                <p className="text-gray-400">
                  Baskı süresi modelin boyutuna, karmaşıklığına ve seçilen kaliteye göre değişir. Küçük bir model birkaç saat sürerken, büyük ve detaylı modeller günler sürebilir.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6">
                <h4 className="font-bold mb-2">Maksimum baskı boyutu nedir?</h4>
                <p className="text-gray-400">
                  Yazıcılarımızda maksimum 250mm x 250mm x 300mm boyutunda baskı yapabiliyoruz. Daha büyük modeller parçalara ayrılabilir.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6">
                <h4 className="font-bold mb-2">Fiyatlandırma nasıl hesaplanıyor?</h4>
                <p className="text-gray-400">
                  Fiyatlar modelin hacmi, seçilen malzeme, kalite ve dolgu yoğunluğuna göre hesaplanır. Sistem otomatik olarak tahmini bir fiyat sunar.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6">
                <h4 className="font-bold mb-2">Sipariş verdikten sonra teslimat ne kadar sürer?</h4>
                <p className="text-gray-400">
                  Baskı süresine ek olarak hazırlık ve kargo süresi eklendiğinde genellikle 2-7 iş günü içinde teslimat yapılır.
                </p>
              </div>
              
              <div className="bg-accent rounded-lg p-6">
                <h4 className="font-bold mb-2">Özel renk veya malzeme talebim olabilir mi?</h4>
                <p className="text-gray-400">
                  Evet, sisteme eklemediğimiz özel renk veya malzeme taleplerinizi notlar kısmına ekleyebilirsiniz. Uygunluk durumuna göre size dönüş yapacağız.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
