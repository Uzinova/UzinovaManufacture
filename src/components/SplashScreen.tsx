import { motion } from 'framer-motion';
import logo from '../logo.png';
import { useEffect, useState } from 'react';

export const SplashScreen = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoadingComplete(true), 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      {/* Advanced Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,1)_0%,rgba(17,24,39,1)_100%)]">
        {/* 3D Grid Effect */}
        <div className="absolute inset-0 perspective-grid opacity-20"></div>
        
        {/* Particle Overlay */}
        <div className="absolute inset-0 particles-overlay"></div>
        
        {/* Accent Light Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-orange-500/10 rounded-full filter blur-[150px] animate-pulse-slow"></div>
          <div className="absolute -bottom-[30%] -right-[20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full filter blur-[180px] animate-pulse-slow-reverse"></div>
          <div className="absolute top-[40%] left-[60%] w-[40%] h-[40%] bg-purple-700/5 rounded-full filter blur-[100px] animate-float-very-slow"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl px-4 flex flex-col items-center">
        {/* Premium Logo Container with Reflection Effect */}
        <div className="relative">
          <motion.div
            className="relative z-10 mb-12"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: { 
                duration: 1.2, 
                type: "spring",
                stiffness: 50
              }
            }}
          >
            <motion.img
              src={logo}
              alt="Logo"
              className="w-64 h-auto filter drop-shadow-[0_0_30px_rgba(249,115,22,0.7)]"
              animate={{ 
                y: [0, -10, 0],
                rotateZ: [0, -1, 0, 1, 0],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Logo light effect */}
            <div className="absolute inset-0 glow-effect"></div>
            
            {/* Logo Reflection */}
            <div className="absolute top-full left-0 w-full scale-y-[-0.3] opacity-20 blur-sm">
              <img src={logo} alt="" className="w-full" />
            </div>
          </motion.div>
        </div>

        {/* Loading Progress */}
        <motion.div 
          className="w-full mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="relative h-1 w-64 mx-auto bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: loadingComplete ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-orange-500 text-sm font-light tracking-widest">
              {loadingComplete ? "READY" : `LOADING ${Math.round(loadingProgress)}%`}
            </p>
          </motion.div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="absolute bottom-12 left-0 w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-gray-400 text-sm tracking-[0.3em] uppercase font-light">Uzay Teknolojisinde Yeni Nesil</p>
        </motion.div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-[15%] left-[15%] w-1 h-1 bg-orange-500 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-[35%] left-[80%] w-2 h-2 bg-blue-500 rounded-full"
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-[70%] left-[25%] w-1.5 h-1.5 bg-purple-500 rounded-full"
          animate={{ 
            scale: [1, 1.8, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute top-[50%] left-[70%] w-1 h-1 bg-orange-300 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
      </div>

      <style>
        {`
          .glow-effect {
            background: radial-gradient(circle at center, rgba(249,115,22,0.4) 0%, transparent 70%);
            filter: blur(15px);
          }
          
          .perspective-grid {
            background-size: 50px 50px;
            background-image: 
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
            transform: perspective(500px) rotateX(60deg) scale(1.8);
            transform-origin: center bottom;
            animation: gridMove 20s linear infinite;
          }
          
          @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
          
          .particles-overlay {
            background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            animation: particlesFade 10s infinite;
          }
          
          @keyframes particlesFade {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          
          @keyframes float-very-slow {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-20px, 20px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }
          
          @keyframes pulse-slow-reverse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.3; }
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 10s ease-in-out infinite;
          }
          
          .animate-pulse-slow-reverse {
            animation: pulse-slow-reverse 10s ease-in-out infinite;
          }
          
          .animate-float-very-slow {
            animation: float-very-slow 15s ease-in-out infinite;
          }
        `}
      </style>
    </motion.div>
  );
}; 