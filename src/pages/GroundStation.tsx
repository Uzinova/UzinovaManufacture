import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Terminal, Wifi, Database, MessageCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function GroundStation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const modules = [
    {
      title: "Roket Takibi",
      icon: <Monitor className="h-6 w-6" />,
      description: "Roketinizin konumunu ve durumunu gerçek zamanlı olarak takip edin. 2D ve 3D görselleştirme ile uçuş verilerini anlık olarak izleyin.",
      stats: "2D/3D görselleştirme • Euler/Quaternion rotasyon • Çoklu iz takibi • Harita entegrasyonu"
    },
    {
      title: "Veri Toplama",
      icon: <Database className="h-6 w-6" />,
      description: "Uçuş sırasında toplanan tüm verileri kaydedin ve analiz edin. Senkronize .csv ve ikili günlük formatında veri kaydı.",
      stats: "Senkronize kayıt • Zaman damgalı indeksleme • Detaylı raporlama • Veri arşivleme"
    },
    {
      title: "İletişim Sistemi",
      icon: <Wifi className="h-6 w-6" />,
      description: "Roket ile güvenli ve kesintisiz iletişim kurun. CRC-kontrollü, geri bildirimli çift-yollu haberleşme sistemi.",
      stats: "CRC kontrollü • Çift yönlü iletişim • Çoklu oturum • CAN desteği • Otomatik yeniden bağlanma"
    },
    {
      title: "Teknofest Hakem Yer İstasyonu",
      icon: <Terminal className="h-6 w-6" />,
      description: "TEKNOFEST hakem yer istasyonu ile tam uyumlu telemetri verisi paylaşımı. Hakemlerin anlık veri izlemesine olanak sağlayan özel arayüz.",
      stats: "HYİ uyumlu veri formatı • Kesintisiz veri aktarımı  • Veri doğrulama sistemi"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" ref={containerRef}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://i.hizliresim.com/49axbtg.jpg" 
            alt="Yer İstasyonu" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <div className="inline-block mb-4">
            <span className="text-blue-500 font-mono text-sm tracking-widest">Uzinova Sky v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-mono">
            Roket Yer İstasyon Yazılımları
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 font-mono">
            Özelleştirilebilir tasarım ve profesyonel roket takip sistemi
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={scrollToProducts}
              className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#0a0a0a] rounded-md group-hover:bg-opacity-0 text-white font-mono">
                Detaylı Bilgi
              </span>
            </button>
          </div>
        </motion.div>
      </div>

    
      {/* Product Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 py-16 xs:py-20 sm:py-24" ref={productsRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-16 xs:space-y-20 sm:space-y-24"
        >
          {/* Yer İstasyonu Product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 items-start">
            <div className="relative rounded-xl overflow-hidden border border-blue-500/20 bg-[#0a0a0a] p-4">
              <img 
                src="https://i.hizliresim.com/swi0tst.gif" 
                alt="Yer İstasyonu" 
                className="w-full aspect-video object-contain rounded-lg"
              />
            </div>
            <div className="space-y-4 xs:space-y-6">
              <h3 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white font-mono">Uzinova Sky</h3>
              <div className="terminal-loader h-full">
                <div className="terminal-header">
                  <div className="terminal-title">IREC 2023 - Las Cruces, New Mexico, ABD</div>
                  <div className="terminal-controls">
                    <div className="control close"></div>
                    <div className="control minimize"></div>
                    <div className="control maximize"></div>
                  </div>
                </div>
                <div className="terminal-content pt-8 space-y-2">
                  <div className="text">Çıkılan Yükseklik: 10,247 ft — BAŞARILI</div>
                  <div className="text">Veri İletim Kalitesi: 2,459/2,446 paket (%99) — BAŞARILI</div>
                  <div className="text">Yükseklik/Veri Gecikme: 10ms/100ft — BAŞARILI</div>
                  <div className="text">Veri Kaydetme: BAŞARILI</div>
                  <div className="text">Simülasyon Veri Uyumu: %98 —BAŞARILI</div>
                  <div className="text">Çoklu Komut Senaryosu: BAŞARILI</div>
                  <div className="text">Uçuş Süresi Takibi: BAŞARILI</div>
                  <div className="text">Azami Hız Doğrulaması: BAŞARILI</div>
                  <div className="text">Kurtarma Sistemi İzleme: BAŞARILI</div>
                  <div className="text font-bold">Genel Durum: BAŞARILI</div>
                </div>
              </div>
            </div>
          </div>

          {/* ThrustLap Product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="relative rounded-xl overflow-hidden border border-blue-500/20 bg-[#0a0a0a] p-4">
              <img 
                src="https://i.hizliresim.com/33drmam." 
                alt="ThrustLab" 
                className="w-full aspect-video object-contain rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white font-mono">ThrustLab </h3>
              <div className="terminal-loader h-full">
                <div className="terminal-header">
                  <div className="terminal-title">TEKNOFEST Dikey İnişli Roket Yarışması - Ankara, Türkiye</div>
                  <div className="terminal-controls">
                    <div className="control close"></div>
                    <div className="control minimize"></div>
                    <div className="control maximize"></div>
                  </div>
                </div>
                <div className="terminal-content pt-8 space-y-2">
                  <div className="text">Veri İletim Kalitesi: 5,460/5,460 paket (%100) — BAŞARILI</div>
                  <div className="text">Anlık Veri Analizi: BAŞARILI</div>
                  <div className="text">Gecikme Süresi: 10ms — BAŞARILI</div>
                  <div className="text">Komut İletimi: BAŞARILI</div>
                  <div className="text">Veri Kaydetme: BAŞARILI</div>
                  <div className="text">Grafik ve Formülizasyon: BAŞARILI</div>
                  <div className="text">Toplam Veri Hacmi Yönetimi: BAŞARILI</div>
                  <div className="text">Sistem Yük Dayanıklılık Testi: BAŞARILI</div>
                  <div className="text">Çoklu Komut Senaryosu: BAŞARILI</div>
                  <div className="text font-bold">Genel Durum: BAŞARILI</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      

        {/* Modules Grid */}
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 py-16 xs:py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 xs:mb-16"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-6 xs:mb-8 font-mono border-b border-blue-500/20 pb-4">Özellikler</h2>
          
          {/* First Two Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 mb-12 xs:mb-16">
            {modules.slice(0, 2).map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-[#111111] p-4 xs:p-6 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-blue-500">{module.icon}</div>
                    <h3 className="text-lg xs:text-xl font-bold text-white font-mono">{module.title}</h3>
                  </div>
                  <p className="text-sm xs:text-base text-gray-400 mb-4 font-mono">{module.description}</p>
                  <p className="text-xs xs:text-sm text-blue-400 font-mono">{module.stats}</p>
                </div>
              </motion.div>
            ))}
          </div>

  

          {/* Last Two Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modules.slice(2, 4).map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-[#111111] p-6 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-blue-500">{module.icon}</div>
                    <h3 className="text-xl font-bold text-white font-mono">{module.title}</h3>
                  </div>
                  <p className="text-gray-400 mb-4 font-mono">{module.description}</p>
                  <p className="text-sm text-blue-400 font-mono">{module.stats}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes blinkCursor {
          50% {
            border-right-color: transparent;
          }
        }

        @keyframes typeText {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .terminal-loader {
          border: 0.1em solid #1a1a1a;
          background-color: #0a0a0a;
          color: #00ff00;
          font-family: "Courier New", Courier, monospace;
          font-size: 0.9em;
          padding: 0.5em;
          width: 100%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .terminal-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2em;
          background-color: #1a1a1a;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 0 1em;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .terminal-controls {
          display: flex;
          gap: 0.5em;
        }

        .control {
          width: 0.75em;
          height: 0.75em;
          border-radius: 50%;
        }

        .terminal-content {
          margin-top: 1.5em;
          padding: 0.5em;
        }

        .text {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          color: #00ff00;
          margin: 0.3em 0;
          padding-left: 1em;
          position: relative;
          width: 0;
          animation: typeText 2s steps(40, end) forwards;
          opacity: 0;
        }

        .text:nth-child(1) { animation-delay: 0.2s; }
        .text:nth-child(2) { animation-delay: 0.4s; }
        .text:nth-child(3) { animation-delay: 0.6s; }
        .text:nth-child(4) { animation-delay: 0.8s; }
        .text:nth-child(5) { animation-delay: 1.0s; }
        .text:nth-child(6) { animation-delay: 1.2s; }
        .text:nth-child(7) { animation-delay: 1.4s; }
        .text:nth-child(8) { animation-delay: 1.6s; }
        .text:nth-child(9) { animation-delay: 1.8s; }
        .text:nth-child(10) { animation-delay: 2.0s; }

        .text::before {
          content: ">";
          position: absolute;
          left: 0;
          color: #00aa00;
        }

        @keyframes typeText {
          0% {
            width: 0;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes blinkCursor {
          0%, 100% {
            border-right-color: #00ff00;
          }
          50% {
            border-right-color: transparent;
          }
        }

        .text::after {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          border-right: 2px solid #00ff00;
          height: 80%;
          animation: blinkCursor 0.8s infinite;
        }

        .text.completed::after {
          display: none;
        }
      `}</style>

      {/* CTA Section */}
      <div className="bg-[#0a0a0a] py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white font-mono">
              Özelleştirilebilir Tasarım
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-mono">
              Yazılım, takımınızın ihtiyaçlarına göre tamamen özelleştirilebilir bir tasarım sunar
            </p>
            <Link to="/contact" className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600">
              <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-[#0a0a0a] rounded-lg group-hover:bg-opacity-0 text-lg font-bold text-white font-mono">
                İletişime Geç
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/905365821902?text=Merhaba, Uzinova ile ilgili bilgi almak istiyorum."
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
    </div>
  );
} 