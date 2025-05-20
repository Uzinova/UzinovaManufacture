import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Cpu, Wifi, Compass, Database, Layers, MessageCircle, Smartphone, Save, PlusCircle, Maximize2 } from 'lucide-react';

// PCB görselleri
const pcbImages = {
  skylink: "https://i.hizliresim.com/f5odnnr.jpg",
  uzinox: "https://i.hizliresim.com/hnzxxbi.jpg",
};

export default function FlightControlPage() {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  useEffect(() => {
    // For animated background
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      document.documentElement.style.setProperty('--mouse-x', x.toString());
      document.documentElement.style.setProperty('--mouse-y', y.toString());
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      
      {/* Background animation */}
      <div className="fixed inset-0 z-0 bg-gradient-radial"></div>
      <div className="fixed inset-0 z-0 bg-circuit-pattern opacity-30"></div>
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <p className="text-green-400 font-medium text-sm tracking-wider uppercase mb-4 inline-flex items-center">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                UZINOVA AEROSPACE
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
                Uzinova <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">Uçuş Kontrol</span> Sistemleri
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Profesyonel roket ve hava araçları için gelişmiş teknoloji ile üretilmiş kontrol kartları
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Animated dots background */}
        <div className="absolute inset-0 z-0 dot-grid-pattern"></div>
        
        {/* PCB animation in background */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10"></div>
      </section>
      
      {/* Products Showcase */}
      <section className="relative py-20 z-10">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold mb-2"
            >
              Uçuş Kontrol Sistemleri
            </motion.h2>
            <div className="w-24 h-1 bg-green-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Yüksek doğruluk ve güvenilirlik sunan profesyonel PCB tasarımlarımız
            </p>
          </div>
          
          {/* Product Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
            {/* UZİNOX-V1 Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative"
            >
              <div 
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  activeCard === 'uzinox' 
                    ? 'bg-gradient-to-b from-green-900/20 to-black/40 border-2 border-green-500/50' 
                    : 'bg-black/40 border border-green-800/30 hover:border-green-500/30'
                }`}
                onClick={() => setActiveCard(activeCard === 'uzinox' ? null : 'uzinox')}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-green-900/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-400 text-xs font-medium uppercase tracking-wider mb-1">Uçuş Kontrol Kartı</p>
                      <h3 className="text-3xl font-bold text-white">UZİNOX-V1</h3>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded-full">
                      <motion.div
                        animate={{ rotate: activeCard === 'uzinox' ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <PlusCircle className="w-6 h-6 text-green-400" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black group-hover:brightness-110 transition-all">
                  <motion.img 
                    src={pcbImages.uzinox}
                    alt="UZİNOX-V1 Uçuş Kontrol Kartı" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeCard === 'uzinox' ? 1.05 : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Circuit Overlay */}
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                  
                  {/* PCB highlight when active */}
                  {activeCard === 'uzinox' && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/70 backdrop-blur-sm text-xs">
                      <div className="flex items-center">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span>6 Katmanlı PCB • <span className="text-green-400">STM32F407VGT6</span> • 168 MHz</span>
                      </div>
                    </div>
                  )}
                  
                  {/* View details button */}
                  <div className="absolute right-4 bottom-4 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-green-900/80 backdrop-blur-sm rounded-full"
                    >
                      <Maximize2 className="w-4 h-4 text-green-400" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Details section */}
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: activeCard === 'uzinox' ? 'auto' : 0,
                    opacity: activeCard === 'uzinox' ? 1 : 0
                  }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Cpu className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Mikrodenetleyici</h4>
                          <p className="text-gray-400 text-xs">STM32F407VGT6</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Wifi className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Telemetri</h4>
                          <p className="text-gray-400 text-xs">Lora E22 900T</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Compass className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">IMU</h4>
                          <p className="text-gray-400 text-xs">MPU6050 6-DOF</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Database className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Basınç</h4>
                          <p className="text-gray-400 text-xs">BMP280</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2 text-xs">
                        <span className="px-2 py-1 bg-green-900/20 rounded-full text-green-400 border border-green-900/50">Roket</span>
                        <span className="px-2 py-1 bg-green-900/20 rounded-full text-green-400 border border-green-900/50">Drone</span>
                        <span className="px-2 py-1 bg-green-900/20 rounded-full text-green-400 border border-green-900/50">UAV</span>
                      </div>
                      
                      <button className="text-xs font-medium text-green-400">
                        Tüm özellikler →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* SkyLink Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div 
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  activeCard === 'skylink' 
                    ? 'bg-gradient-to-b from-green-900/20 to-black/40 border-2 border-green-500/50' 
                    : 'bg-black/40 border border-green-800/30 hover:border-green-500/30'
                }`}
                onClick={() => setActiveCard(activeCard === 'skylink' ? null : 'skylink')}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-green-900/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-400 text-xs font-medium uppercase tracking-wider mb-1">Kablosuz İletişim Modülü</p>
                      <h3 className="text-3xl font-bold text-white">SkyLink</h3>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded-full">
                      <motion.div
                        animate={{ rotate: activeCard === 'skylink' ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <PlusCircle className="w-6 h-6 text-green-400" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black group-hover:brightness-110 transition-all">
                  <motion.img 
                    src={pcbImages.skylink}
                    alt="SkyLink Kablosuz İletişim Modülü" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeCard === 'skylink' ? 1.05 : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Circuit Overlay */}
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                  
                  {/* PCB highlight when active */}
                  {activeCard === 'skylink' && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/70 backdrop-blur-sm text-xs">
                      <div className="flex items-center">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span>Dairesel PCB • <span className="text-green-400">ESP8266</span> • WiFi İletişim</span>
                      </div>
                    </div>
                  )}
                  
                  {/* View details button */}
                  <div className="absolute right-4 bottom-4 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-green-900/80 backdrop-blur-sm rounded-full"
                    >
                      <Maximize2 className="w-4 h-4 text-green-400" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Details section */}
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: activeCard === 'skylink' ? 'auto' : 0,
                    opacity: activeCard === 'skylink' ? 1 : 0
                  }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Wifi className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">WiFi Modülü</h4>
                          <p className="text-gray-400 text-xs">ESP8266</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Smartphone className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Ekran</h4>
                          <p className="text-gray-400 text-xs">OLED Display</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Layers className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Boyut</h4>
                          <p className="text-gray-400 text-xs">40mm Dairesel PCB</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Save className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Batarya</h4>
                          <p className="text-gray-400 text-xs">CR2032 Pil Yuvası</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2 text-xs">
                        <span className="px-2 py-1 bg-green-900/20 rounded-full text-green-400 border border-green-900/50">Roket</span>
                        <span className="px-2 py-1 bg-green-900/20 rounded-full text-green-400 border border-green-900/50">Telemetri</span>
                      </div>
                      
                      <button className="text-xs font-medium text-green-400">
                        Tüm özellikler →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Technical Showcase */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-circuit-board opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold mb-2"
              >
                Teknik Detaylar
              </motion.h2>
              <div className="w-24 h-1 bg-green-500 mx-auto mb-6"></div>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Uzinova uçuş kontrol sistemleri, yüksek doğruluk ve güvenilirlik sunan teknik özelliklere sahiptir
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/30 border border-green-800/30 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                  <Cpu className="mr-2 h-5 w-5" /> UZİNOX-V1 Özellikleri
                </h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">STM32F407VGT6</span>
                      <p className="text-gray-400 text-sm">32-bit ARM Cortex-M4, 168 MHz, 1 MB Flash</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Boyutlar</span>
                      <p className="text-gray-400 text-sm">60 mm x 100 mm 6 katmanlı PCB</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Telemetri & GPS</span>
                      <p className="text-gray-400 text-sm">Lora E22 900T modülü ve NEO-8M GPS</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Sensörler</span>
                      <p className="text-gray-400 text-sm">MPU6050 (6-DOF) ve BMP280 basınç sensörü</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Hafıza & Genişletilebilirlik</span>
                      <p className="text-gray-400 text-sm">MikroSD kart, UART, I2C, SPI headerları</p>
                    </div>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/30 border border-green-800/30 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                  <Wifi className="mr-2 h-5 w-5" /> SkyLink Özellikleri
                </h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">ESP8266 WiFi</span>
                      <p className="text-gray-400 text-sm">Kablosuz veri iletimi ve uzaktan kontrol</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Dairesel PCB</span>
                      <p className="text-gray-400 text-sm">40 mm yarıçapında modüler tasarım</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">OLED Ekran</span>
                      <p className="text-gray-400 text-sm">Uçuş verilerinin anlık görüntülenmesi</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Bağlantı & Güç</span>
                      <p className="text-gray-400 text-sm">MicroUSB bağlantısı ve CR2032 pil yuvası</p>
                    </div>
                  </li>
             
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* İletişim Bölümü */}
      <section className="relative py-20 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-green-400 font-medium text-sm tracking-wider uppercase mb-2">İLETİŞİM</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Profesyonel Destek</h2>
              <div className="w-24 h-1 bg-green-500 mx-auto mb-6"></div>
              <p className="text-gray-400">Teknik ekibimiz, ihtiyaçlarınıza özel çözümler için yanınızda</p>
            </div>
            
            <div className="flex justify-center mt-8">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/905365821902?text=Merhaba, Uzinova ile ilgili bilgi almak istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-all shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp ile İletişime Geç
              </motion.a>
            </div>
          </div>
        </div>
      </section>
      
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/905365821902?text=Merhaba, Uzinova ile ilgili bilgi almak istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 bottom-6 z-50 group"
      >
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Floating Animation */}
          <div className="absolute -inset-2 bg-green-500/20 rounded-full animate-ping"></div>
          
          {/* Button */}
          <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Bize WhatsApp'tan Ulaşın
          </div>
        </motion.div>
      </a>
      
      {/* CSS Styles */}
      <style>
        {`
        /* Radial background that follows mouse */
        .bg-gradient-radial {
          background: radial-gradient(
            circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), 
            rgb(22, 101, 52, 0.2) 0%, 
            transparent 50%
          );
        }
        
        /* Circuit pattern background */
        .bg-circuit-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,20 L80,20 L80,80 L20,80 Z' fill='none' stroke='%2322c55e' stroke-width='0.5'/%3E%3Cpath d='M0,40 L20,40 M40,40 L60,40 M80,40 L100,40 M50,0 L50,20 M50,40 L50,60 M50,80 L50,100' stroke='%2322c55e' stroke-width='0.5'/%3E%3Ccircle cx='20' cy='40' r='2' fill='%2322c55e'/%3E%3Ccircle cx='80' cy='40' r='2' fill='%2322c55e'/%3E%3Ccircle cx='50' cy='20' r='2' fill='%2322c55e'/%3E%3Ccircle cx='50' cy='80' r='2' fill='%2322c55e'/%3E%3C/svg%3E");
          background-size: 40px 40px;
        }
        
        /* Background with dots */
        .dot-grid-pattern {
          background-image: radial-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Circuit board pattern */
        .bg-circuit-board {
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L200,0 L200,200 L0,200 Z' fill='none' stroke='%2322c55e' stroke-width='0.5'/%3E%3Cpath d='M20,0 L20,200 M40,0 L40,200 M60,0 L60,200 M80,0 L80,200 M100,0 L100,200 M120,0 L120,200 M140,0 L140,200 M160,0 L160,200 M180,0 L180,200 M0,20 L200,20 M0,40 L200,40 M0,60 L200,60 M0,80 L200,80 M0,100 L200,100 M0,120 L200,120 M0,140 L200,140 M0,160 L200,160 M0,180 L200,180' stroke='%2322c55e' stroke-width='0.25'/%3E%3C/svg%3E");
          background-size: 40px 40px;
        }
        `}
      </style>
    </div>
  );
} 