import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
      return <Navigate to="/feed" />;
  }

  const handleLogin = async () => {
    try {
      console.log("Attempting Login..."); // Debug
      await login();
      console.log("Login Successful!"); // Debug
      navigate('/feed');
    } catch (error) {
      console.error("Login Failed Code:", error.code);
      console.error("Login Failed Message:", error.message);
      alert(`Login Failed: ${error.message}`); // Show alert to user
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 bg-surface/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl w-full max-w-md text-center shadow-2xl"
      >
        <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Zap className="text-black fill-black" size={40} />
            </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4 tracking-tighter">
            Local<span className="text-primary">host</span>.
        </h1>
        <p className="text-gray-400 text-lg mb-8 font-medium">
            The exclusive network for engineers who actually ship code. 🚀
        </p>

        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full bg-white text-black font-black text-lg py-4 rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Continue with Google
        </motion.button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
            <ShieldCheck size={14} />
            <span>ENGINEERS ONLY</span>
        </div>
      </motion.div>

      {/* Footer Text */}
      <p className="absolute bottom-8 text-gray-600 font-mono text-xs">
          Built for the 1% of the internet.
      </p>
    </div>
  );
}
