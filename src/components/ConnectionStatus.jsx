import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

export default function ConnectionStatus() {
    const [status, setStatus] = useState('checking'); // checking, connected, disconnected, error
    const [lastCheck, setLastCheck] = useState(null);

    const checkConnection = async () => {
        try {
            const res = await apiClient.get('/health');
            if (res.data.services?.mongodb === 'connected') {
                setStatus('connected');
            } else {
                setStatus('disconnected');
            }
            setLastCheck(new Date());
        } catch (error) {
            // Check if it's a network/SSL error
            if (error.code === 'ERR_NETWORK' || error.message?.includes('SSL') || error.message?.includes('ERR_SSL')) {
                console.error('Connection error - check if backend is running and using http (not https)');
            }
            setStatus('error');
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (status === 'checking') {
        return null; // Don't show anything while checking
    }

    const getIcon = () => {
        switch (status) {
            case 'connected':
                return <Wifi size={16} className="text-green-400" />;
            case 'disconnected':
                return <WifiOff size={16} className="text-yellow-400" />;
            case 'error':
                return <AlertCircle size={16} className="text-red-400" />;
            default:
                return null;
        }
    };

    const getMessage = () => {
        switch (status) {
            case 'connected':
                return 'Connected';
            case 'disconnected':
                return 'Backend disconnected';
            case 'error':
                return 'Connection error';
            default:
                return '';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-surface/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-white shadow-lg">
            {getIcon()}
            <span>{getMessage()}</span>
        </div>
    );
}

