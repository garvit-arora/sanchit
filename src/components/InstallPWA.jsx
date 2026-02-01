import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notify } from '../utils/notify';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIosDevice);

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (isIOS) {
                notify("To install on iOS: Tap Share and select Add to Home Screen", "info");
            }
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
            setDeferredPrompt(null);
        }
    };

    if (!isVisible && !isIOS) return null;
    // For now, show iOS prompt if not installed (logic can be improved to check standalone)
    if (isIOS && window.matchMedia('(display-mode: standalone)').matches) return null;

    return (
        <AnimatePresence>
            {(isVisible || (isIOS && !window.matchMedia('(display-mode: standalone)').matches)) && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
                >
                    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Download className="w-4 h-4 text-purple-400" />
                                Install App
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {isIOS
                                    ? "Tap Share → Add to Home Screen to install"
                                    : "Install settings for a better experience"}
                            </p>
                        </div>

                        {!isIOS && (
                            <button
                                onClick={handleInstallClick}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Install
                            </button>
                        )}

                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWA;
