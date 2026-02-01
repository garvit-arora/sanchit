import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { aiService } from '../services/aiService';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function FlashcardGenerator() {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');
    const [docText, setDocText] = useState('');
    const [cards, setCards] = useState([]);
    const [rawOutput, setRawOutput] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }
        setError('');
        setIsParsing(true);
        setCards([]);
        setRawOutput('');
        setFileName(file.name);
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
            setDocText(fullText);
        } catch (uploadError) {
            setError('Failed to parse PDF. Try a different file.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleGenerate = async () => {
        if (!docText) {
            setError('Upload a PDF to generate flashcards.');
            return;
        }
        setError('');
        setIsGenerating(true);
        setCards([]);
        setRawOutput('');
        try {
            await aiService.init();
            const prompt = `Create 8 study flashcards from the content below.
Return ONLY valid JSON with this exact format:
[
  {"question": "...", "answer": "..."}
]

Content:
${docText.substring(0, 3500)}
`;
            const response = await aiService.chat([
                { role: 'system', content: 'You generate concise study flashcards in JSON.' },
                { role: 'user', content: prompt }
            ]);
            const trimmed = response.trim();
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    setCards(parsed);
                } else {
                    setRawOutput(trimmed);
                }
            } catch (parseError) {
                setRawOutput(trimmed);
            }
        } catch (genError) {
            setError('Flashcard generation failed. Try again.');
        } finally {
            setIsGenerating(false);
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-5">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-bold text-blue-300">Flashcard Generator</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
                        Turn Notes Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Flashcards</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Upload a PDF and let WebLLM create quick study cards.
                    </p>
                </motion.div>

                <div className="bg-surface border border-white/10 rounded-3xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-white font-bold">Upload PDF</div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-xs font-black bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
                            disabled={isParsing}
                        >
                            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isParsing ? 'Parsing...' : 'Choose File'}
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleUpload}
                    />
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <FileText className="text-white" size={18} />
                        </div>
                        <div className="text-xs text-gray-400">
                            {fileName || 'No file selected'}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!docText || isGenerating}
                        className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                    </button>
                    {error && (
                        <div className="mt-4 text-sm text-red-400 font-semibold">{error}</div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map((card, index) => (
                        <div key={`${card.question}-${index}`} className="bg-surface border border-white/10 rounded-2xl p-5">
                            <div className="text-xs text-gray-500 font-bold mb-2">Q{index + 1}</div>
                            <div className="text-white font-semibold mb-3">{card.question}</div>
                            <div className="text-gray-400 text-sm">{card.answer}</div>
                        </div>
                    ))}
                </div>

                {rawOutput && (
                    <div className="mt-8 bg-black/30 border border-white/10 rounded-2xl p-5 text-sm text-gray-300 whitespace-pre-wrap">
                        {rawOutput}
                    </div>
                )}
            </div>
        </div>
    );
}
