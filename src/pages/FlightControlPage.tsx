import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Cpu, Wifi, Compass, Database, Layers, MessageCircle, Smartphone, Save, PlusCircle, Maximize2, Settings, Edit, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AdminGuard } from '../components/AdminGuard';
import { QuerySnapshot, DocumentData } from 'firebase/firestore';

// PCB görselleri
const pcbImages = {
  skylink: "https://i.imgur.com/K7SGMLB.png",
  uzinox: "https://i.imgur.com/T67yiIN.png",
  landx: "https://i.hizliresim.com/klwvgwb.jpg",
  uzinoxV2: "https://i.hizliresim.com/hfgzftt.PNG"
};

interface PCBPoint {
  id: number;
  x: number;
  y: number;
  label: string;
  desc: string;
}

interface FirebasePCBPoint extends PCBPoint {
  cardType: string;
}

export default function FlightControlPage() {
  const { isAdmin } = useAuth();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingPoint, setEditingPoint] = useState<{id: number, card: string} | null>(null);
  const [newPointLabel, setNewPointLabel] = useState("");
  const [newPointDesc, setNewPointDesc] = useState("");
  
  // PCB points states
  const [uzinoxPoints, setUzinoxPoints] = useState<PCBPoint[]>([]);
  const [skylinkPoints, setSkylinkPoints] = useState<PCBPoint[]>([]);
  const [landxPoints, setLandxPoints] = useState<PCBPoint[]>([]);
  const [uzinoxV2Points, setUzinoxV2Points] = useState<PCBPoint[]>([]);
  
  // Refs for images
  const uzinoxImgRef = useRef<HTMLImageElement>(null);
  const skylinkImgRef = useRef<HTMLImageElement>(null);
  const landxImgRef = useRef<HTMLImageElement>(null);
  const uzinoxV2ImgRef = useRef<HTMLImageElement>(null);

  // Load PCB points from Firebase
  useEffect(() => {
    const loadPCBPoints = async () => {
      try {
        const pointsRef = db.collection('pcbPoints');
        const snapshot = await db.getDocs(pointsRef);
        
        const points: { [key: string]: PCBPoint[] } = {
          uzinox: [],
          skylink: [],
          landx: [],
          uzinoxV2: []
        };
        
        if ('docs' in snapshot) {
          snapshot.docs.forEach((doc) => {
            const data = doc.data() as FirebasePCBPoint;
            const cardType = data.cardType;
            if (points[cardType]) {
              points[cardType].push({
                id: data.id,
                x: data.x,
                y: data.y,
                label: data.label,
                desc: data.desc
              });
            }
          });
        }
        
        setUzinoxPoints(points.uzinox);
        setSkylinkPoints(points.skylink);
        setLandxPoints(points.landx);
        setUzinoxV2Points(points.uzinoxV2);
      } catch (error) {
        console.error("Error loading PCB points:", error);
      }
    };
    
    loadPCBPoints();
  }, []);

  // Save PCB points to Firebase
  const savePointsToFirebase = async (cardType: string, points: PCBPoint[]) => {
    try {
      const pointsRef = db.collection('pcbPoints');
      
      // Delete existing points for this card type
      const existingPoints = await db.getDocs(db.query(pointsRef, db.where('cardType', '==', cardType)));
      if ('docs' in existingPoints) {
        for (const doc of existingPoints.docs) {
          if ('ref' in doc) {
            await db.deleteDoc(doc.ref);
          }
        }
      }
      
      // Add new points
      for (const point of points) {
        await db.addDoc(pointsRef, {
          ...point,
          cardType
        });
      }
    } catch (error) {
      console.error("Error saving PCB points:", error);
    }
  };
  
  // Point management functions
  const addNewPoint = async (cardType: string) => {
    if (!isAdmin) return;
    
    let newPoints: PCBPoint[];
    let setPoints: React.Dispatch<React.SetStateAction<PCBPoint[]>>;
    
    switch (cardType) {
      case 'uzinox':
        newPoints = [...uzinoxPoints];
        setPoints = setUzinoxPoints;
        break;
      case 'skylink':
        newPoints = [...skylinkPoints];
        setPoints = setSkylinkPoints;
        break;
      case 'landx':
        newPoints = [...landxPoints];
        setPoints = setLandxPoints;
        break;
      case 'uzinoxV2':
        newPoints = [...uzinoxV2Points];
        setPoints = setUzinoxV2Points;
        break;
      default:
        return;
    }
    
    const newId = newPoints.length > 0 ? Math.max(...newPoints.map(p => p.id)) + 1 : 1;
    const newPoint = { id: newId, x: 50, y: 50, label: "Yeni Nokta", desc: "Açıklama" };
    
    setPoints([...newPoints, newPoint]);
    await savePointsToFirebase(cardType, [...newPoints, newPoint]);
  };
  
  const deletePoint = async (id: number, cardType: string) => {
    if (!isAdmin) return;
    
    let newPoints: PCBPoint[];
    let setPoints: React.Dispatch<React.SetStateAction<PCBPoint[]>>;
    
    switch (cardType) {
      case 'uzinox':
        newPoints = uzinoxPoints.filter(point => point.id !== id);
        setPoints = setUzinoxPoints;
        break;
      case 'skylink':
        newPoints = skylinkPoints.filter(point => point.id !== id);
        setPoints = setSkylinkPoints;
        break;
      case 'landx':
        newPoints = landxPoints.filter(point => point.id !== id);
        setPoints = setLandxPoints;
        break;
      case 'uzinoxV2':
        newPoints = uzinoxV2Points.filter(point => point.id !== id);
        setPoints = setUzinoxV2Points;
        break;
      default:
        return;
    }
    
    setPoints(newPoints);
    await savePointsToFirebase(cardType, newPoints);
  };

  const startEditPoint = (id: number, cardType: string) => {
    if (!isAdmin) return;
    
    let pointToEdit: PCBPoint | undefined;
    
    switch (cardType) {
      case 'uzinox':
        pointToEdit = uzinoxPoints.find(p => p.id === id);
        break;
      case 'skylink':
        pointToEdit = skylinkPoints.find(p => p.id === id);
        break;
      case 'landx':
        pointToEdit = landxPoints.find(p => p.id === id);
        break;
      case 'uzinoxV2':
        pointToEdit = uzinoxV2Points.find(p => p.id === id);
        break;
    }
      
    if (pointToEdit) {
      setEditingPoint({ id, card: cardType });
      setNewPointLabel(pointToEdit.label);
      setNewPointDesc(pointToEdit.desc);
    }
  };
  
  const saveEditPoint = async () => {
    if (!editingPoint || !isAdmin) return;
    
    let newPoints: PCBPoint[];
    let setPoints: React.Dispatch<React.SetStateAction<PCBPoint[]>>;
    
    switch (editingPoint.card) {
      case 'uzinox':
        newPoints = uzinoxPoints.map(point => 
          point.id === editingPoint.id 
            ? { ...point, label: newPointLabel, desc: newPointDesc }
            : point
        );
        setPoints = setUzinoxPoints;
        break;
      case 'skylink':
        newPoints = skylinkPoints.map(point => 
          point.id === editingPoint.id 
            ? { ...point, label: newPointLabel, desc: newPointDesc }
            : point
        );
        setPoints = setSkylinkPoints;
        break;
      case 'landx':
        newPoints = landxPoints.map(point => 
          point.id === editingPoint.id 
            ? { ...point, label: newPointLabel, desc: newPointDesc }
            : point
        );
        setPoints = setLandxPoints;
        break;
      case 'uzinoxV2':
        newPoints = uzinoxV2Points.map(point => 
          point.id === editingPoint.id 
            ? { ...point, label: newPointLabel, desc: newPointDesc }
            : point
        );
        setPoints = setUzinoxV2Points;
        break;
      default:
        return;
    }
    
    setPoints(newPoints);
    setEditingPoint(null);
  };
  
  const movePoint = async (e: React.MouseEvent | MouseEvent, id: number, cardType: string, imgRef: React.RefObject<HTMLImageElement>) => {
    if (!isAdminMode || !imgRef.current || !isAdmin) return;
    
    const imgRect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - imgRect.left) / imgRect.width) * 100;
    const y = ((e.clientY - imgRect.top) / imgRect.height) * 100;
    
    let newPoints: PCBPoint[];
    let setPoints: React.Dispatch<React.SetStateAction<PCBPoint[]>>;
    
    switch (cardType) {
      case 'uzinox':
        newPoints = uzinoxPoints.map(point => 
          point.id === id ? { ...point, x, y } : point
        );
        setPoints = setUzinoxPoints;
        break;
      case 'skylink':
        newPoints = skylinkPoints.map(point => 
          point.id === id ? { ...point, x, y } : point
        );
        setPoints = setSkylinkPoints;
        break;
      case 'landx':
        newPoints = landxPoints.map(point => 
          point.id === id ? { ...point, x, y } : point
        );
        setPoints = setLandxPoints;
        break;
      case 'uzinoxV2':
        newPoints = uzinoxV2Points.map(point => 
          point.id === id ? { ...point, x, y } : point
        );
        setPoints = setUzinoxV2Points;
        break;
      default:
        return;
    }
    
    setPoints(newPoints);
  };
  
  useEffect(() => {
    // Sayfa yüklendiğinde scrollu en üste taşı
    window.scrollTo(0, 0);
  }, []);
  
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
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/70"></div>
          <img 
            style={{
              width: "100%", 
              height: "100%", 
              transform: "scale(1.5)",
              objectFit: "cover"
            }}
            src="https://hanbaoindia.com/cdn/shop/files/c566da_912db225572946cbba6a31f8cbc91b59_mv2.gif?v=1725973123&width=3840" 
            alt="PCB Animation" 
            className="opacity-40"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center space-x-2 bg-green-500/30 backdrop-blur-sm p-2 rounded-full w-fit mx-auto mb-6">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-400 font-medium text-sm tracking-wider uppercase">UZINOVA SPACE SYSTEMS</span>
              </div>
              
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-10 tracking-tight leading-tight px-4 py-2 text-shadow-glow">
                Uzinova <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">Uçuş Kontrol</span> Sistemleri
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto backdrop-blur-sm py-2">
                Profesyonel roket ve hava araçları için gelişmiş teknoloji ile üretilmiş kontrol kartları
              </p>
              
              <div className="mt-8">
                <button 
                  onClick={() => {
                    const productsSection = document.querySelector('.products-showcase');
                    productsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-medium inline-flex items-center space-x-2 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                >
                  <span>İNCELE</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* PCB animation in background */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10"></div>
      </section>
      
      {/* Admin Mode Toggle Button - Only visible to admins */}
      {isAdmin && (
        <div className="fixed top-24 right-4 z-50">
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="bg-black/80 border border-green-500/50 p-2 rounded-full shadow-lg"
            title={isAdminMode ? "Admin Modunu Kapat" : "Admin Modunu Aç"}
          >
            <Settings className={`w-6 h-6 ${isAdminMode ? 'text-green-400' : 'text-white/50'} transition-all`} />
          </button>
        </div>
      )}
      
      {/* Admin Panel - Only visible to admins */}
      {isAdmin && isAdminMode && (
        <div className="fixed left-4 top-24 z-50 bg-black/90 border border-green-500/50 p-4 rounded-xl shadow-lg max-w-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-green-400 font-bold">PCB Admin Paneli</h3>
            <button onClick={() => setIsAdminMode(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <p className="text-gray-300">PCB noktalarını düzenlemek için:</p>
            <ul className="text-gray-300 text-xs list-disc pl-4">
              <li>Kartı açın ve noktaları sürükleyin</li>
              <li>Nokta detaylarını düzenleyin</li>
            </ul>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {setActiveCard('uzinox'); addNewPoint('uzinox');}} 
                className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs"
              >
                UZİNOX-V1 Ekle
              </button>
              
              <button 
                onClick={() => {setActiveCard('skylink'); addNewPoint('skylink');}}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs"
              >
                SkyLink Ekle
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => {setActiveCard('landx'); addNewPoint('landx');}}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs"
              >
                LandX Ekle
              </button>
              
              <button 
                onClick={() => {setActiveCard('uzinoxV2'); addNewPoint('uzinoxV2');}}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs"
              >
                UZİNOX-V2 Ekle
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <button 
                onClick={() => {
                  const removeDuplicates = (points: PCBPoint[]) => {
                    const seen = new Set<number>();
                    return points.filter(point => {
                      if (seen.has(point.id)) {
                        return false;
                      }
                      seen.add(point.id);
                      return true;
                    });
                  };

                  setUzinoxPoints(prev => removeDuplicates(prev));
                  setSkylinkPoints(prev => removeDuplicates(prev));
                  setLandxPoints(prev => removeDuplicates(prev));
                  setUzinoxV2Points(prev => removeDuplicates(prev));
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
              >
                Tekrar Eden Noktaları Temizle
              </button>

              <button 
                onClick={() => {
                  const removeNewPoints = (points: PCBPoint[]) => {
                    return points.filter(point => point.label !== "Yeni Nokta");
                  };

                  setUzinoxPoints(prev => removeNewPoints(prev));
                  setSkylinkPoints(prev => removeNewPoints(prev));
                  setLandxPoints(prev => removeNewPoints(prev));
                  setUzinoxV2Points(prev => removeNewPoints(prev));
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
              >
                "Yeni Nokta" Etiketlerini Temizle
              </button>

              <button 
                onClick={async () => {
                  try {
                    await savePointsToFirebase('uzinox', uzinoxPoints);
                    await savePointsToFirebase('skylink', skylinkPoints);
                    await savePointsToFirebase('landx', landxPoints);
                    await savePointsToFirebase('uzinoxV2', uzinoxV2Points);
                    alert('Tüm değişiklikler kaydedildi!');
                  } catch (error) {
                    console.error('Kaydetme hatası:', error);
                    alert('Kaydetme sırasında bir hata oluştu!');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
              >
                Tüm Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Point Edit Modal */}
      {editingPoint && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-green-500/50 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Nokta Düzenle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Komponent Adı</label>
                <input 
                  type="text" 
                  value={newPointLabel} 
                  onChange={(e) => setNewPointLabel(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 text-white px-3 py-2 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Açıklama</label>
                <input 
                  type="text" 
                  value={newPointDesc} 
                  onChange={(e) => setNewPointDesc(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 text-white px-3 py-2 rounded-lg"
                />
              </div>
              
              <div className="flex justify-between mt-6">
                <button 
                  onClick={() => setEditingPoint(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  onClick={saveEditPoint}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Showcase */}
      <section className="relative py-20 z-10 products-showcase">
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
                    ref={uzinoxImgRef}
                    src={pcbImages.uzinox}
                    alt="UZİNOX-V1 Uçuş Kontrol Kartı" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeCard === 'uzinox' ? 1.05 : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Circuit Overlay */}
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                  
                  {/* PCB Points */}
                  {(activeCard === 'uzinox' || isAdminMode) && uzinoxPoints.map(point => (
                    <div 
                      key={point.id}
                      className={`absolute z-20 ${isAdminMode ? 'cursor-move' : 'cursor-pointer'}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onMouseDown={isAdminMode ? (e) => {
                        e.stopPropagation();
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          movePoint(moveEvent, point.id, 'uzinox', uzinoxImgRef);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      } : undefined}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${hoveredPoint === point.id ? 'bg-green-500' : 'bg-green-700/60'} flex items-center justify-center cursor-pointer transition-all duration-300 border border-green-500`}>
                          <span className="text-xs font-bold text-white">{point.id}</span>
                        </div>
                        
                        {hoveredPoint === point.id && (
                          <div className="absolute z-30 top-8 left-0 bg-black/80 backdrop-blur-md border border-green-500/20 p-2 rounded-md text-xs w-36">
                            <p className="font-bold text-green-400">{point.label}</p>
                            <p className="text-gray-300">{point.desc}</p>
                            
                            {isAdminMode && (
                              <div className="flex mt-2 space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditPoint(point.id, 'uzinox');
                                  }}
                                  className="p-1 bg-blue-600 rounded-md"
                                >
                                  <Edit className="w-3 h-3 text-white" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePoint(point.id, 'uzinox');
                                  }}
                                  className="p-1 bg-red-600 rounded-md"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
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
                    ref={skylinkImgRef}
                    src={pcbImages.skylink}
                    alt="SkyLink Kablosuz İletişim Modülü" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeCard === 'skylink' ? 1.05 : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Circuit Overlay */}
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                  
                  {/* PCB Points */}
                  {(activeCard === 'skylink' || isAdminMode) && skylinkPoints.map(point => (
                    <div 
                      key={point.id}
                      className={`absolute z-20 ${isAdminMode ? 'cursor-move' : 'cursor-pointer'}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onMouseDown={isAdminMode ? (e) => {
                        e.stopPropagation();
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          movePoint(moveEvent, point.id, 'skylink', skylinkImgRef);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      } : undefined}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${hoveredPoint === point.id ? 'bg-green-500' : 'bg-green-700/60'} flex items-center justify-center cursor-pointer transition-all duration-300 border border-green-500`}>
                          <span className="text-xs font-bold text-white">{point.id}</span>
                        </div>
                        
                        {hoveredPoint === point.id && (
                          <div className="absolute z-30 top-8 left-0 bg-black/80 backdrop-blur-md border border-green-500/20 p-2 rounded-md text-xs w-36">
                            <p className="font-bold text-green-400">{point.label}</p>
                            <p className="text-gray-300">{point.desc}</p>
                            
                            {isAdminMode && (
                              <div className="flex mt-2 space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditPoint(point.id, 'skylink');
                                  }}
                                  className="p-1 bg-blue-600 rounded-md"
                                >
                                  <Edit className="w-3 h-3 text-white" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePoint(point.id, 'skylink');
                                  }}
                                  className="p-1 bg-red-600 rounded-md"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* PCB highlight when active */}
                  {activeCard === 'skylink' && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/70 backdrop-blur-sm text-xs">
                      <div className="flex items-center">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span>SkyLink PCB • <span className="text-green-400">ESP8266</span> • WiFi İletişim</span>
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
                          <Cpu className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Mikrodenetleyici</h4>
                          <p className="text-gray-400 text-xs">ESP32 3S Dual-Core</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Wifi className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">İletişim</h4>
                          <p className="text-gray-400 text-xs">WiFi + Lora + GPS</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Database className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Sensörler</h4>
                          <p className="text-gray-400 text-xs">BMP280 + 2x Pyro</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Save className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Hafıza</h4>
                          <p className="text-gray-400 text-xs">Harici Bellek Desteği</p>
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

            {/* LandX Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative"
            >
              <div 
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  activeCard === 'landx' 
                    ? 'bg-gradient-to-b from-green-900/20 to-black/40 border-2 border-green-500/50' 
                    : 'bg-black/40 border border-green-800/30 hover:border-green-500/30'
                }`}
                onClick={() => setActiveCard(activeCard === 'landx' ? null : 'landx')}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-green-900/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-400 text-xs font-medium uppercase tracking-wider mb-1">Uçuş Kontrol Kartı</p>
                      <h3 className="text-3xl font-bold text-white">LandX</h3>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded-full">
                      <motion.div
                        animate={{ rotate: activeCard === 'landx' ? 180 : 0 }}
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
                    ref={landxImgRef}
                    src={pcbImages.landx}
                    alt="LandX Uçuş Kontrol Kartı" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeCard === 'landx' ? 1.05 : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Circuit Overlay */}
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                  
                  {/* PCB Points */}
                  {(activeCard === 'landx' || isAdminMode) && landxPoints.map(point => (
                    <div 
                      key={point.id}
                      className={`absolute z-20 ${isAdminMode ? 'cursor-move' : 'cursor-pointer'}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onMouseDown={isAdminMode ? (e) => {
                        e.stopPropagation();
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          movePoint(moveEvent, point.id, 'landx', landxImgRef);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      } : undefined}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${hoveredPoint === point.id ? 'bg-green-500' : 'bg-green-700/60'} flex items-center justify-center cursor-pointer transition-all duration-300 border border-green-500`}>
                          <span className="text-xs font-bold text-white">{point.id}</span>
                        </div>
                        
                        {hoveredPoint === point.id && (
                          <div className="absolute z-30 top-8 left-0 bg-black/80 backdrop-blur-md border border-green-500/20 p-2 rounded-md text-xs w-36">
                            <p className="font-bold text-green-400">{point.label}</p>
                            <p className="text-gray-300">{point.desc}</p>
                            
                            {isAdminMode && (
                              <div className="flex mt-2 space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditPoint(point.id, 'landx');
                                  }}
                                  className="p-1 bg-blue-600 rounded-md"
                                >
                                  <Edit className="w-3 h-3 text-white" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePoint(point.id, 'landx');
                                  }}
                                  className="p-1 bg-red-600 rounded-md"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* PCB highlight when active */}
                  {activeCard === 'landx' && (
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
                    height: activeCard === 'landx' ? 'auto' : 0,
                    opacity: activeCard === 'landx' ? 1 : 0
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
                          <p className="text-gray-400 text-xs">BNO055 9-DOF</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Database className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Basınç</h4>
                          <p className="text-gray-400 text-xs">MS5611</p>
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

            {/* UzinoxV2 Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative"
            >
              <div 
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  activeCard === 'uzinoxV2' 
                    ? 'bg-gradient-to-b from-green-900/20 to-black/40 border-2 border-green-500/50' 
                    : 'bg-black/40 border border-green-800/30 hover:border-green-500/30'
                }`}
                onClick={() => setActiveCard(activeCard === 'uzinoxV2' ? null : 'uzinoxV2')}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-green-900/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-400 text-xs font-medium uppercase tracking-wider mb-1">Uçuş Kontrol Kartı</p>
                      <h3 className="text-3xl font-bold text-white">UZİNOX-V2</h3>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded-full">
                      <motion.div
                        animate={{ rotate: activeCard === 'uzinoxV2' ? 180 : 0 }}
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
                    ref={uzinoxV2ImgRef}
                    src={pcbImages.uzinoxV2}
                    alt="UZİNOX-V2 Uçuş Kontrol Kartı" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 1 }}
                    animate={{ scale: activeCard === 'uzinoxV2' ? 1.05 : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Circuit Overlay */}
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay"></div>
                  
                  {/* PCB Points */}
                  {(activeCard === 'uzinoxV2' || isAdminMode) && uzinoxV2Points.map(point => (
                    <div 
                      key={point.id}
                      className={`absolute z-20 ${isAdminMode ? 'cursor-move' : 'cursor-pointer'}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onMouseDown={isAdminMode ? (e) => {
                        e.stopPropagation();
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          movePoint(moveEvent, point.id, 'uzinoxV2', uzinoxV2ImgRef);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      } : undefined}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full ${hoveredPoint === point.id ? 'bg-green-500' : 'bg-green-700/60'} flex items-center justify-center cursor-pointer transition-all duration-300 border border-green-500`}>
                          <span className="text-xs font-bold text-white">{point.id}</span>
                        </div>
                        
                        {hoveredPoint === point.id && (
                          <div className="absolute z-30 top-8 left-0 bg-black/80 backdrop-blur-md border border-green-500/20 p-2 rounded-md text-xs w-36">
                            <p className="font-bold text-green-400">{point.label}</p>
                            <p className="text-gray-300">{point.desc}</p>
                            
                            {isAdminMode && (
                              <div className="flex mt-2 space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditPoint(point.id, 'uzinoxV2');
                                  }}
                                  className="p-1 bg-blue-600 rounded-md"
                                >
                                  <Edit className="w-3 h-3 text-white" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePoint(point.id, 'uzinoxV2');
                                  }}
                                  className="p-1 bg-red-600 rounded-md"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* PCB highlight when active */}
                  {activeCard === 'uzinoxV2' && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/70 backdrop-blur-sm text-xs">
                      <div className="flex items-center">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span>50×50mm PCB • <span className="text-green-400">STM32</span> • 16MB Flash</span>
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
                    height: activeCard === 'uzinoxV2' ? 'auto' : 0,
                    opacity: activeCard === 'uzinoxV2' ? 1 : 0
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
                          <p className="text-gray-400 text-xs">STM32 (Cortex-M4)</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Wifi className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Telemetri</h4>
                          <p className="text-gray-400 text-xs">Lora E22 (900MHz)</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Compass className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">IMU</h4>
                          <p className="text-gray-400 text-xs">BNO055 9-DOF</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 flex items-start space-x-3">
                        <div className="bg-green-900/60 p-2 rounded-lg">
                          <Database className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200 text-sm">Hafıza</h4>
                          <p className="text-gray-400 text-xs">16MB Flash + SD Kart</p>
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
                      <span className="font-medium">Mikrodenetleyici</span>
                      <p className="text-gray-400 text-sm">ESP32 3S Dual-Core</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">İletişim</span>
                      <p className="text-gray-400 text-sm">WiFi + Lora + GPS</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Sensörler</span>
                      <p className="text-gray-400 text-sm">BMP280 + 2x Pyro</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Hafıza</span>
                      <p className="text-gray-400 text-sm">Harici Bellek Desteği</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/30 border border-green-800/30 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                  <Cpu className="mr-2 h-5 w-5" /> LandX Özellikleri
                </h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">STM32F407VGT6</span>
                      <p className="text-gray-400 text-sm">32-bit ARM Cortex-M4, 168 MHz</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Boyutlar</span>
                      <p className="text-gray-400 text-sm">50 mm x 50 mm 6 katmanlı PCB</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">IMU Sensörü</span>
                      <p className="text-gray-400 text-sm">BNO055 9-DOF IMU sensörü</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Basınç Sensörü</span>
                      <p className="text-gray-400 text-sm">MS5611 yüksek hassasiyetli basınç sensörü</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Telemetri & GPS</span>
                      <p className="text-gray-400 text-sm">Lora E22 telemetri modülü ve GPS desteği</p>
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
                  <Cpu className="mr-2 h-5 w-5" /> UZİNOX-V2 Özellikleri
                </h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Mikrodenetleyici</span>
                      <p className="text-gray-400 text-sm">STM32 Cortex-M4 işlemci</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Hafıza</span>
                      <p className="text-gray-400 text-sm">16MB Flash + MicroSD kart desteği</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">IMU Sensörü</span>
                      <p className="text-gray-400 text-sm">BNO055 9-DOF IMU</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Telemetri</span>
                      <p className="text-gray-400 text-sm">Lora E22 (900MHz) telemetri modülü</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">Boyutlar</span>
                      <p className="text-gray-400 text-sm">50 mm x 50 mm kompakt tasarım</p>
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
        
        /* Text shadow for header */
        .text-shadow-glow {
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.3), 
                      0 0 20px rgba(74, 222, 128, 0.2), 
                      0 0 30px rgba(74, 222, 128, 0.1);
        }
        `}
      </style>
    </div>
  );
} 