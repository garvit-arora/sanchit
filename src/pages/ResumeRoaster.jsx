import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Sparkles, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ResumeRoaster() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const fileInputRef = useRef(null);
    const [resumeText, setResumeText] = useState(userProfile?.resumeText || '');
    const [roast, setRoast] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isRoasting, setIsRoasting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setResumeText(userProfile?.resumeText || '');
    }, [userProfile?.resumeText]);

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF resume.');
            return;
        }
        setError('');
        setIsParsing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            setResumeText(fullText);
            await apiClient.put('/auth/profile', {
                uid: currentUser?.uid,
                resumeText: fullText
            });
            if (refreshProfile) {
                await refreshProfile();
            }
        } catch (uploadError) {
            setError('Failed to parse resume. Try another PDF.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleRoast = async () => {
        if (!resumeText) {
            setError('Upload your resume PDF first.');
            return;
        }
        setError('');
        setIsRoasting(true);
        setRoast('');
        try {
            await aiService.init();
            const prompt = `You are a sharp but helpful resume roaster. Be brutally honest but constructive.
Include an ATS score out of 100, a short roast, and a clear improvements list.

Return format:
ATS Score: <number>/100
Roast:
- ...
Improvements:
- ...

Resume:
${resumeText.substring(0, 3500)}
`;
            const response = await aiService.chat([
                { role: 'system', content: 'You roast resumes with tough love but give actionable fixes.' },
                { role: 'user', content: prompt }
            ]);
            setRoast(response);
        } catch (roastError) {
            setError('Roast failed. Try again.');
        } finally {
            setIsRoasting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text p-4">
            <div className="max-w-5xl mx-auto pt-12 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-5">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                        <span className="text-sm font-bold text-orange-300">Resume Roaster</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
                        Get Your Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Roasted</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Upload your resume PDF in your profile and get a brutally honest roast powered by WebLLM.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                    <div className="bg-surface border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Resume Status</h2>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-xs font-black bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
                                disabled={isParsing}
                            >
                                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isParsing ? 'Parsing...' : 'Upload PDF'}
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleUpload}
                        />

                        <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <FileText className="text-white" size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">
                                        {resumeText ? 'Resume Loaded' : 'No Resume Found'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {resumeText ? 'Ready to roast' : 'Upload a PDF resume to continue'}
                                    </div>
                                </div>
                            </div>
                            {resumeText && (
                                <div className="mt-4 text-xs text-gray-500 line-clamp-4">
                                    {resumeText.substring(0, 400)}...
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 text-sm text-red-400 font-semibold">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleRoast}
                            disabled={!resumeText || isRoasting}
                            className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 text-black font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
                        >
                            {isRoasting ? 'Roasting...' : 'Roast My Resume'}
                        </button>
                    </div>

                    <div className="bg-surface border border-white/10 rounded-3xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Roast Output</h2>
                        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 min-h-[260px] whitespace-pre-wrap text-sm text-gray-300">
                            {roast || 'Your roast will appear here after analysis.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
