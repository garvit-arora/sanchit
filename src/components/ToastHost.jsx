import React, { useEffect, useState } from 'react';

const typeStyles = {
    info: 'bg-white/10 text-white border-white/10',
    success: 'bg-green-500/10 text-green-200 border-green-500/30',
    error: 'bg-red-500/10 text-red-200 border-red-500/30',
    warning: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30'
};

export default function ToastHost() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const handler = (event) => {
            const { message, type } = event.detail || {};
            if (!message) return;
            const id = `${Date.now()}-${Math.random()}`;
            setItems(prev => [...prev, { id, message, type: type || 'info' }]);
            setTimeout(() => {
                setItems(prev => prev.filter(item => item.id !== id));
            }, 3000);
        };
        window.addEventListener('app-toast', handler);
        return () => window.removeEventListener('app-toast', handler);
    }, []);

    if (items.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[60] space-y-3">
            {items.map(item => (
                <div
                    key={item.id}
                    className={`px-4 py-3 rounded-xl border shadow-lg backdrop-blur ${typeStyles[item.type] || typeStyles.info}`}
                >
                    <div className="text-sm font-semibold">{item.message}</div>
                </div>
            ))}
        </div>
    );
}
