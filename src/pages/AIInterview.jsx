import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, Play, Square, 
  Brain, Clock, Target, Award, ChevronRight,
  RefreshCw, CheckCircle, XCircle, Loader2,
  MessageSquare, TrendingUp, Star, Zap, Headphones, Radio
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

const InterviewQuestionCard = ({ question, index, isActive, userAnswer, onAnswerChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-6 rounded-2xl border transition-all ${
      isActive 
        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50' 
        : 'bg-white/5 border-white/10'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-3">{question}</h3>
        {userAnswer && !isActive && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-sm">✓ Answered</p>
          </div>
        )}
        {isActive && (
          <textarea
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(index, e.target.value)}
            placeholder="Your answer will appear here as you speak..."
            className="w-full mt-3 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            readOnly
          />
        )}
      </div>
    </div>
  </motion.div>
);

const InterviewMetrics = ({ speakingTime, questionCount, accuracy }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
    >
      <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
      <div className="text-xl font-bold text-white">{speakingTime}s</div>
      <div className="text-xs text-gray-400">Speaking Time</div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
    >
      <Target className="w-5 h-5 text-green-400 mx-auto mb-2" />
      <div className="text-xl font-bold text-white">{questionCount}</div>
      <div className="text-xs text-gray-400">Questions</div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
    >
      <Award className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
      <div className="text-xl font-bold text-white">{accuracy}%</div>
      <div className="text-xs text-gray-400">Accuracy</div>
    </motion.div>
  </div>
);

const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <label className="block text-white font-semibold mb-3">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white flex items-center justify-between hover:border-white/40 transition-all"
      >
        <span className="capitalize">{value.replace('-', ' ')}</span>
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full p-4 text-left hover:bg-white/10 transition-all flex items-center gap-3 ${
                value === option.value ? 'bg-blue-500/20 text-blue-400' : 'text-white'
              }`}
            >
              <option.icon className="w-5 h-5" />
              <span className="capitalize">{option.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default function AIInterview() {
  const { currentUser } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed
  const [interviewTopic, setInterviewTopic] = useState('software-engineering');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [speakingTime, setSpeakingTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [answerQuality, setAnswerQuality] = useState('neutral'); // good, bad, neutral
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentQuestionRef = useRef(0);
  const autoModeRef = useRef(false);
  const interviewStateRef = useRef('setup');
  const isListeningRef = useRef(false);
  const answerBufferRef = useRef({});
  const [interimTranscript, setInterimTranscript] = useState('');

  const interviewTopics = [
    { value: 'software-engineering', label: 'Software Engineering', icon: Brain },
    { value: 'data-science', label: 'Data Science', icon: TrendingUp },
    { value: 'product-management', label: 'Product Management', icon: Target },
    { value: 'marketing', label: 'Marketing', icon: MessageSquare },
    { value: 'sales', label: 'Sales', icon: Radio },
    { value: 'general', label: 'General Behavioral', icon: MessageSquare }
  ];

  useEffect(() => {
    currentQuestionRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  useEffect(() => {
    interviewStateRef.current = interviewState;
  }, [interviewState]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalText = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        const index = currentQuestionRef.current;
        const prevFinal = answerBufferRef.current[index] || '';
        const updatedFinal = prevFinal + finalText;
        if (finalText) {
          answerBufferRef.current[index] = updatedFinal;
        }

        const displayText = updatedFinal + interimText;
        setInterimTranscript(interimText);
        setTranscript(displayText);
        setAnswers(prev => ({
          ...prev,
          [index]: displayText
        }));

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          if (autoModeRef.current && isListeningRef.current) {
            stopListening();
            setTimeout(() => evaluateAndProceed(), 800);
          }
        }, 3000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        isListeningRef.current = false;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const evaluateAnswer = async (question, answer) => {
    if (!answer.trim()) return 'neutral';
    
    try {
      await aiService.init();
      
      const prompt = `Evaluate this interview answer and respond with only one word: "good", "bad", or "neutral".\n\nQuestion: ${question}\nAnswer: ${answer}\n\nEvaluation:`;

      const response = await aiService.chat([
        { role: 'system', content: 'You are an expert interview evaluator. Evaluate answers briefly.' },
        { role: 'user', content: prompt }
      ]);

      const evaluation = response.toLowerCase().trim();
      if (evaluation.includes('good')) return 'good';
      if (evaluation.includes('bad')) return 'bad';
      return 'neutral';
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      return 'neutral';
    }
  };

  const evaluateAndProceed = async () => {
    const currentAnswer = answers[currentQuestionIndex] || '';
    const quality = await evaluateAnswer(questions[currentQuestionIndex], currentAnswer);
    setAnswerQuality(quality);

    if (currentQuestionIndex >= questions.length - 1) {
      completeInterview();
      return;
    }

    await generateNextQuestion(quality);
  };

  const generateNextQuestion = async (quality = 'neutral') => {
    try {
      await aiService.init();
      
      const difficultyPrompt = quality === 'good' ? 'make it more challenging' : 
                              quality === 'bad' ? 'make it easier and more basic' : 
                              'keep it at the same level';
      
      const prompt = `Generate 1 ${difficulty} level interview question for ${interviewTopic}. 
      The previous answer was ${quality}. ${difficultyPrompt}.
      Return only the question, no extra text.`;

      const response = await aiService.chat([
        { role: 'system', content: 'You are an expert interview coach. Generate appropriate follow-up questions.' },
        { role: 'user', content: prompt }
      ]);

      const newQuestion = response.trim();
      if (newQuestion) {
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex + 1] = newQuestion;
        setQuestions(updatedQuestions);
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTranscript('');
        setInterimTranscript('');
        answerBufferRef.current[nextIndex] = '';
        setTimeout(() => speakQuestion(newQuestion), 600);
      }
    } catch (error) {
      console.error('Failed to generate next question:', error);
    }
  };

  const generateQuestions = async () => {
    setInterviewState('generating');
    try {
      await aiService.init();
      
      const prompt = `Generate 5 ${difficulty} level interview questions for ${interviewTopic}. 
      Make them challenging but appropriate for the level. Include both technical and behavioral questions.
      Return only the questions, one per line, no numbering or extra text.`;

      const response = await aiService.chat([
        { role: 'system', content: 'You are an expert interview coach. Generate high-quality interview questions.' },
        { role: 'user', content: prompt }
      ]);

      const generatedQuestions = response.split('\n').filter(q => q.trim().length > 0);
      const finalQuestions = generatedQuestions.slice(0, 5);
      setQuestions(finalQuestions);
      setInterviewState('active');
      setCurrentQuestionIndex(0);
      setTranscript('');
      setInterimTranscript('');
      answerBufferRef.current = {};
      setTimeout(() => speakQuestion(finalQuestions[0]), 700);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      const fallback = [
        'Tell me about yourself and your background.',
        'What is your greatest strength and how have you used it?',
        'Describe a challenging project you worked on.',
        'How do you handle tight deadlines and pressure?',
        'Where do you see yourself in five years?'
      ];
      setQuestions(fallback);
      setInterviewState('active');
      setCurrentQuestionIndex(0);
      setTranscript('');
      setInterimTranscript('');
      answerBufferRef.current = {};
      setTimeout(() => speakQuestion(fallback[0]), 700);
    }
  };

  const speakQuestion = (question) => {
    if (!synthesisRef.current || isMuted) return;
    if (isListeningRef.current) {
      stopListening();
    }
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (autoModeRef.current && interviewStateRef.current === 'active') {
        setTimeout(() => startListening(), 300);
      }
    };
    
    synthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      notify('Speech recognition not supported in your browser', 'warning');
      return;
    }

    const index = currentQuestionRef.current;
    if (answerBufferRef.current[index] === undefined) {
      answerBufferRef.current[index] = answers[index] || '';
    }
    setInterimTranscript('');
    setTranscript(answerBufferRef.current[index] || '');
    try {
      recognitionRef.current.start();
    } catch (error) {
      return;
    }
    setIsListening(true);
    isListeningRef.current = true;
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setSpeakingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    isListeningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTranscript('');
      setInterimTranscript('');
      answerBufferRef.current[nextIndex] = answers[nextIndex] || '';
      
      if (autoMode) {
        // In auto mode, just clear and let the system handle it
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: prev[currentQuestionIndex] || '' }));
      } else {
        // Manual mode - speak next question
        speakQuestion(questions[nextIndex]);
      }
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    setInterviewState('completed');
    stopListening();
  };

  const calculateAccuracy = () => {
    const answeredQuestions = Object.keys(answers).filter(key => answers[key]?.trim().length > 0).length;
    return Math.round((answeredQuestions / questions.length) * 100);
  };

  const resetInterview = () => {
    setInterviewState('setup');
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTranscript('');
    setInterimTranscript('');
    setSpeakingTime(0);
    setIsListening(false);
    setIsSpeaking(false);
    setAutoMode(false);
    setAnswerQuality('neutral');
    answerBufferRef.current = {};
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  if (interviewState === 'setup') {
    return (
      <div className="min-h-screen bg-background text-text p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
              <Headphones className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-blue-400">AI Interview Coach</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-6">
              Ace Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Interview</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Practice with AI-powered interviews. Get real-time feedback and improve your communication skills.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Interview Setup</h2>
            
            <div className="space-y-6">
              <CustomSelect
                label="Interview Topic"
                value={interviewTopic}
                onChange={setInterviewTopic}
                options={interviewTopics}
              />

              <div>
                <label className="block text-white font-semibold mb-3">Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAutoMode(false)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      !autoMode
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Manual
                  </button>
                  <button
                    onClick={() => setAutoMode(true)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      autoMode
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    Auto Mode
                  </button>
                </div>
                {autoMode && (
                  <p className="text-xs text-gray-400 mt-2">Auto mode: AI will automatically evaluate your answers and adjust difficulty</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-3 rounded-xl border capitalize transition-all ${
                        difficulty === level
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:border-white/40'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateQuestions}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start AI Interview
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (interviewState === 'generating') {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Generating Interview Questions</h2>
          <p className="text-gray-400">AI is preparing your personalized interview...</p>
        </div>
      </div>
    );
  }

  if (interviewState === 'active') {
    return (
      <div className="min-h-screen bg-background text-text p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">AI Interview in Progress</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Mode:</span>
                <span className={`text-sm font-bold ${autoMode ? 'text-green-400' : 'text-blue-400'}`}>
                  {autoMode ? 'Auto' : 'Manual'}
                </span>
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-xl border transition-all ${
                  isMuted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/20 text-white'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={resetInterview}
                className="p-3 bg-white/5 border border-white/20 rounded-xl text-gray-300 hover:text-white transition-all"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          </div>

          <InterviewMetrics 
            speakingTime={speakingTime}
            questionCount={currentQuestionIndex + 1}
            accuracy={calculateAccuracy()}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Current Question</h2>
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 mb-6 relative">
                <h3 className="text-xl text-white font-semibold">
                  {questions[currentQuestionIndex]}
                </h3>
                {isSpeaking && (
                  <div className="mt-4 flex items-center gap-2 text-blue-400">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">AI is speaking...</span>
                  </div>
                )}
                {autoMode && answerQuality && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                    answerQuality === 'good' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    answerQuality === 'bad' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {answerQuality === 'good' ? 'Excellent!' : 
                     answerQuality === 'bad' ? 'Keep practicing!' : 'Good effort!'}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {!autoMode && (
                  <div className="flex gap-4">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => speakQuestion(questions[currentQuestionIndex])}
                      className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {autoMode && (
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                      isListening ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/20 text-gray-400'
                    }`}>
                      {isListening ? (
                        <>
                          <Mic className="w-4 h-4 animate-pulse" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Ready to speak</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {isListening ? 'Speak naturally - I\'ll stop after 3 seconds of silence' : 'Listening starts after the question finishes'}
                    </p>
                  </div>
                )}
              </div>

              {transcript && (
                <div className="mt-4 p-4 bg-white/5 border border-white/20 rounded-xl">
                  <p className="text-white text-sm">{transcript}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Progress</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.slice(0, currentQuestionIndex + 1).map((question, index) => (
                  <InterviewQuestionCard
                    key={index}
                    question={question}
                    index={index}
                    isActive={index === currentQuestionIndex}
                    userAnswer={answers[index]}
                    onAnswerChange={(idx, answer) => setAnswers(prev => ({ ...prev, [idx]: answer }))}
                  />
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                {autoMode ? (
                  <button
                    onClick={evaluateAndProceed}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Evaluate & Next
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <ChevronRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Complete Interview
                      </>
                    )}
                  </button>
                )}
                {!autoMode && (
                  <button
                    onClick={evaluateAndProceed}
                    className="px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                  >
                    <Target className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (interviewState === 'completed') {
    const accuracy = calculateAccuracy();
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).filter(key => answers[key]?.trim().length > 0).length;

    return (
      <div className="min-h-screen bg-background text-text p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 mb-6">
              <Award className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-green-400">Interview Completed!</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-6">
              Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Results</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-6 text-center"
            >
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{answeredQuestions}/{totalQuestions}</div>
              <div className="text-gray-400">Questions Answered</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 text-center"
            >
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{speakingTime}s</div>
              <div className="text-gray-400">Total Speaking Time</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center"
            >
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{accuracy}%</div>
              <div className="text-gray-400">Completion Rate</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-white/10 rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              Your Responses
            </h2>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="border-b border-white/10 pb-6 last:border-b-0">
                  <h3 className="text-white font-semibold mb-3">{question}</h3>
                  <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                    <p className="text-gray-300">
                      {answers[index] || <span className="text-gray-500 italic">Not answered</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={resetInterview}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Practice Again
            </button>
            <button
              onClick={() => window.location.href = '/study'}
              className="bg-white/5 border border-white/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 transition-all"
            >
              Back to Study Zone
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
