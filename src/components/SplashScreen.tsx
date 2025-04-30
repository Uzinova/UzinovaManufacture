import { motion } from 'framer-motion';
import logo from '../logo.png';

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-orange-500/30 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full filter blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-3xl animate-float"></div>

        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid opacity-20"></div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
        className="relative z-10"
      >
        <motion.img
          src={logo}
          alt="Uzinovas Logo"
          className="w-96 h-auto drop-shadow-[0_0_30px_rgba(249,115,22,0.7)]"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.2
          }}
        />
      </motion.div>

      <style>
        {`
          .bg-grid {
            background-size: 50px 50px;
            background-image: 
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
            animation: gridMove 20s linear infinite;
          }

          @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }

          @keyframes float {
            0%, 100% { transform: translate(-50%, -50%); }
            50% { transform: translate(-50%, -60%); }
          }

          @keyframes float-delay {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
          }

          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-20px, 20px); }
          }

          .animate-float {
            animation: float 8s ease-in-out infinite;
          }

          .animate-float-delay {
            animation: float-delay 9s ease-in-out infinite;
          }

          .animate-float-slow {
            animation: float-slow 10s ease-in-out infinite;
          }
        `}
      </style>
    </motion.div>
  );
}; 