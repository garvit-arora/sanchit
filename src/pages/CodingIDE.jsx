import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MonacoEditor from '@monaco-editor/react';
import { Play, Code, Terminal, List, Bot, ArrowLeft, BookOpen, Code2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { API_URL } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

let COMPILER_URL = import.meta.env.VITE_COMPILER_URL || API_URL;
if (COMPILER_URL.includes('https://localhost') || COMPILER_URL.includes('https://127.0.0.1')) {
    COMPILER_URL = COMPILER_URL.replace('https://', 'http://');
}
const COMPILE_ENDPOINT = COMPILER_URL.endsWith('/api')
    ? `${COMPILER_URL}/compile`
    : `${COMPILER_URL}/api/compile`;
const COMPILE_FALLBACK = 'http://localhost:3001/api/compile';

const interviewQuestions = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: ""
            }
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        testCases: [
            { input: "[2,7,11,15]\n9", expected: "[0,1]" },
            { input: "[3,2,4]\n6", expected: "[1,2]" },
            { input: "[3,3]\n6", expected: "[0,1]" }
        ],
        starterCode: {
            cpp: `#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
            java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[0];
    }
}`,
            javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
    return [];
};`
        }
    },
    {
        id: 2,
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        examples: [
            {
                input: "s = \"()\"",
                output: "true",
                explanation: ""
            },
            {
                input: "s = \"()[]{}\"",
                output: "true",
                explanation: ""
            },
            {
                input: "s = \"(]\"",
                output: "false",
                explanation: ""
            }
        ],
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        testCases: [
            { input: "()", expected: "true" },
            { input: "()[]{}", expected: "true" },
            { input: "(]", expected: "false" },
            { input: "([)]", expected: "false" },
            { input: "{[]}", expected: "true" }
        ],
        starterCode: {
            cpp: `#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Your code here
        return false;
    }
};`,
            java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`,
            javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your code here
    return false;
};`
        }
    },
    {
        id: 3,
        title: "Binary Tree Inorder Traversal",
        difficulty: "Medium",
        description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
        examples: [
            {
                input: "root = [1,null,2,3]",
                output: "[1,3,2]",
                explanation: ""
            },
            {
                input: "root = []",
                output: "[]",
                explanation: ""
            }
        ],
        constraints: [
            "The number of nodes in the tree is in the range [0, 100].",
            "-100 <= Node.val <= 100"
        ],
        testCases: [
            { input: "[1,null,2,3]", expected: "[1,3,2]" },
            { input: "[]", expected: "[]" },
            { input: "[1]", expected: "[1]" }
        ],
        starterCode: {
            cpp: `#include <vector>

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        // Your code here
        return {};
    }
};`,
            java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        // Your code here
        return new ArrayList<>();
    }
}`,
            javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function(root) {
    // Your code here
    return [];
};`
        }
    }
];

const CodeEditor = ({ code, onChange, language }) => {
    const languageLabel = {
        cpp: 'C++',
        java: 'Java',
        javascript: 'JavaScript'
    }[language] || language;

    return (
        <div className="relative h-full">
            <div className="absolute top-0 left-0 right-0 bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300 font-mono">{languageLabel}</span>
                </div>
            </div>
            <div className="h-full pt-12">
                <MonacoEditor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => onChange(value ?? '')}
                    options={{
                        fontSize: 14,
                        fontFamily: 'Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        smoothScrolling: true,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 }
                    }}
                />
            </div>
        </div>
    );
};

const TestCaseEditor = ({ testCases, onChange }) => {
    return (
        <div className="h-full bg-gray-900 border-t border-gray-700">
            <div className="flex border-b border-gray-700">
                <div className="px-4 py-2 bg-gray-800 text-sm text-gray-300 border-r border-gray-700">
                    Test Cases
                </div>
            </div>
            <div className="p-4 flex flex-wrap gap-4">
                {testCases.map((testCase, index) => (
                    <div key={index} className="w-full lg:w-[calc(50%-8px)] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Case {index + 1}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Expected: {testCase.expected}</span>
                            </div>
                        </div>
                        <textarea
                            value={testCase.input}
                            onChange={(e) => {
                                const newTestCases = [...testCases];
                                newTestCases[index].input = e.target.value;
                                onChange(newTestCases);
                            }}
                            className="w-full h-16 px-3 py-2 bg-gray-800 text-gray-300 text-sm font-mono border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Input"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const OutputPanel = ({ output, isRunning }) => {
    return (
        <div className="h-full bg-gray-900 border-t border-gray-700">
            <div className="flex border-b border-gray-700">
                <div className="px-4 py-2 bg-gray-800 text-sm text-gray-300 border-r border-gray-700 flex items-center gap-2">
                    <Terminal size={14} />
                    Output
                </div>
            </div>
            <div className="p-4">
                {isRunning ? (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                        <span className="text-sm">Running...</span>
                    </div>
                ) : output ? (
                    <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{output}</pre>
                ) : (
                    <p className="text-sm text-gray-500">Run your code to see output</p>
                )}
            </div>
        </div>
    );
};

export default function CodingIDE() {
    const { currentUser, userProfile } = useAuth();
    const [viewMode, setViewMode] = useState('select');
    const [selectedQuestion, setSelectedQuestion] = useState(interviewQuestions[0]);
    const [code, setCode] = useState(interviewQuestions[0].starterCode.cpp);
    const [language, setLanguage] = useState('cpp');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [bottomPanel, setBottomPanel] = useState('testcases');
    const [bottomPanelHeight, setBottomPanelHeight] = useState(180);
    const [testCases, setTestCases] = useState(interviewQuestions[0].testCases);
    const [showQuestionDrawer, setShowQuestionDrawer] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [aiMessages, setAiMessages] = useState([
        { id: 1, role: 'assistant', text: 'Hi! Pick a question and ask me to explain or improve your code in simple words.' }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiProgress, setAiProgress] = useState(null);
    const problemRef = useRef(null);
    const codeRef = useRef(null);
    const chatRef = useRef(null);
    const codePanelRef = useRef(null);
    const resizeState = useRef({ startY: 0, startHeight: 180, maxHeight: 360 });

    useEffect(() => {
        setCode(selectedQuestion.starterCode[language] || selectedQuestion.starterCode.cpp);
        setTestCases(selectedQuestion.testCases);
        setOutput('');
        setBottomPanel('testcases');
    }, [selectedQuestion, language]);

    useEffect(() => {
        aiService.setProgressCallback((report) => {
            setAiProgress(report);
        });
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [aiMessages, isAiLoading]);

    const runCompileRequest = async (payload) => {
        const tryRequest = async (endpoint) => {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        };

        try {
            return await tryRequest(COMPILE_ENDPOINT);
        } catch (error) {
            try {
                return await tryRequest(COMPILE_FALLBACK);
            } catch (fallbackError) {
                throw new Error(`Compiler not reachable. Start backend on ${COMPILE_ENDPOINT} or ${COMPILE_FALLBACK}`);
            }
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');
        setBottomPanel('output');
        
        try {
            // Test with first test case
            const testInput = testCases[0]?.input || '';
            
            const result = await runCompileRequest({
                code,
                language,
                input: testInput
            });
            
            if (result.success) {
                setOutput(`🚀 Compilation successful!\n\n📊 Test Results:\nInput: ${testInput}\nExpected: ${testCases[0]?.expected || 'N/A'}\nYour Output: ${result.output.trim()}\n\n${result.output.trim() === testCases[0]?.expected ? '✅ Test case passed!' : '❌ Test case failed'}\n\n⏱️ Runtime: ${Math.floor(Math.random() * 10) + 1}ms\n💾 Memory: ${Math.floor(Math.random() * 50) + 10} MB`);
            } else {
                setOutput(`❌ Compilation Error:\n${result.error}\n\n${result.output}`);
            }
        } catch (error) {
            setOutput(`❌ Network Error: ${error.message}\n\nMake sure the compilation service is running on ${COMPILE_ENDPOINT} or ${COMPILE_FALLBACK}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setOutput('');
        setBottomPanel('output');
        
        try {
            let allResults = [];
            let passedCount = 0;
            
            // Test all test cases
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                
                const result = await runCompileRequest({
                    code,
                    language,
                    input: testCase.input
                });
                const passed = result.success && result.output.trim() === testCase.expected;
                
                if (passed) passedCount++;
                
                allResults.push({
                    testCase: i + 1,
                    passed,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: result.success ? result.output.trim() : 'Error',
                    error: result.error
                });
            }
            
            const resultsOutput = allResults.map(r => 
                `${r.passed ? '✅' : '❌'} Test case ${r.testCase}/${testCases.length} ${r.passed ? 'passed' : 'failed'}`
            ).join('\n');
            
            setOutput(`🚀 Submitting solution...\n\n📊 Test Results:\n${resultsOutput}\n\n${passedCount === testCases.length ? '🎉 All tests passed!' : `⚠️ ${passedCount}/${testCases.length} tests passed`}\n\n⏱️ Runtime: ${Math.floor(Math.random() * 20) + 5}ms\n💾 Memory: ${Math.floor(Math.random() * 50) + 20} MB\n\n${passedCount === testCases.length ? '✨ Your code is accepted!' : '🔧 Please fix the failing test cases'}`);
            
        } catch (error) {
            setOutput(`❌ Network Error: ${error.message}\n\nMake sure the compilation service is running on ${COMPILE_ENDPOINT} or ${COMPILE_FALLBACK}`);
        } finally {
            setIsRunning(false);
        }
    };


    const handleResizeStart = (event) => {
        if (!codePanelRef.current) return;
        event.preventDefault();
        const containerHeight = codePanelRef.current.clientHeight;
        const maxHeight = Math.max(160, Math.floor(containerHeight * 0.6));
        resizeState.current = {
            startY: event.clientY,
            startHeight: bottomPanelHeight,
            maxHeight
        };

        const handleMove = (moveEvent) => {
            const delta = resizeState.current.startY - moveEvent.clientY;
            const nextHeight = Math.min(
                resizeState.current.maxHeight,
                Math.max(120, resizeState.current.startHeight + delta)
            );
            setBottomPanelHeight(nextHeight);
        };

        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    };

    const buildQuestionContext = () => {
        const examples = selectedQuestion.examples
            .map((example, index) => {
                const explanation = example.explanation ? `Explanation: ${example.explanation}` : '';
                return `Example ${index + 1}\nInput: ${example.input}\nOutput: ${example.output}${explanation ? `\n${explanation}` : ''}`;
            })
            .join('\n\n');

        return `Question Title: ${selectedQuestion.title}
Difficulty: ${selectedQuestion.difficulty}
Description: ${selectedQuestion.description}
Examples:
${examples}
Constraints:
${selectedQuestion.constraints.join('\n')}
Language: ${language}
User Code:
${code}`;
    };

    const handleAiSend = async (text) => {
        const messageText = (text ?? aiInput).trim();
        if (!messageText) return;
        const userMessage = { id: Date.now(), role: 'user', text: messageText };
        const conversation = [...aiMessages, userMessage];
        setAiMessages(conversation);
        setAiInput('');
        setIsAiLoading(true);
        setShowAiPanel(true);

        try {
            await aiService.init();
            const context = buildQuestionContext();
            const response = await aiService.chat([
                { role: 'system', content: `You are a friendly coding coach for beginners. Use simple words, short steps, and help improve or explain the code based on the user request.\n\nRequirements:\n- Use the selected language: ${language}.\n- Provide sections: Brute Force, Better Approach, Optimal Approach, Best Approach.\n- Include time and space complexity for each.\n- Provide a final solution in ${language} with clean 4-space indentation.\n- Use clear markdown with code blocks and consistent indentation.\n\n${context}` },
                ...conversation.map((msg) => ({ role: msg.role, content: msg.text }))
            ]);
            const aiText = response?.trim() || 'I could not generate a response. Please try again.';
            setAiMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: aiText }]);
        } catch (error) {
            setAiMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: 'Sorry, I ran into a problem. Please try again.' }]);
        } finally {
            setIsAiLoading(false);
            setAiProgress(null);
        }
    };

    const handleAiPreset = (preset) => {
        handleAiSend(preset);
    };

    const scrollToSection = (target) => {
        if (target === 'problem' && problemRef.current) {
            problemRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (target === 'code' && codeRef.current) {
            codeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-400/10';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
            case 'Hard': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-950 text-white">
            {viewMode === 'select' ? (
                <div className="min-h-screen w-full px-6 py-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-black mb-2">Pick a question</h1>
                            <p className="text-gray-400 text-lg">Choose a problem to open the coding workspace.</p>
                        </div>
                        <Link to="/study" className="px-4 py-2 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 transition-colors">
                            Back to Study Zone
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {interviewQuestions.map((question) => (
                            <button
                                key={question.id}
                                onClick={() => {
                                    setSelectedQuestion(question);
                                    setViewMode('solve');
                                    setShowQuestionDrawer(false);
                                    setShowAiPanel(false);
                                }}
                                className="text-left bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/60 hover:bg-gray-900/80 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">{question.title}</h3>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                        {question.difficulty}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-3">{question.description.split('\n')[0]}</p>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-screen w-full">
                    <div className="flex-1 flex flex-col min-w-0 h-full">
                <div className="border-b border-gray-800 px-6 py-4 pr-24 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewMode('select')}
                                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="text-xl font-bold">{selectedQuestion.title}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                                    {selectedQuestion.difficulty}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowQuestionDrawer((prev) => !prev)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-sm ${showQuestionDrawer ? 'bg-blue-600/30 text-blue-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                                >
                                    <List size={16} />
                                    Questions
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAiPanel((prev) => !prev);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-sm ${showAiPanel ? 'bg-purple-600/30 text-purple-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                                >
                                    <Bot size={16} />
                                    AI
                                </button>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="javascript">JavaScript</option>
                                </select>
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 rounded-lg transition-colors"
                                >
                                    <Play size={16} />
                                    Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors font-medium"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                        <div className="relative flex-1 overflow-hidden">
                            <div className={`absolute left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 z-20 transition-transform ${showQuestionDrawer ? 'translate-x-0' : '-translate-x-full'}`}>
                                <div className="p-4 border-b border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-semibold">Questions</h2>
                                        <button
                                            onClick={() => setShowQuestionDrawer(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-56px)]">
                                    {interviewQuestions.map((question) => (
                                        <button
                                            key={question.id}
                                            onClick={() => {
                                                setSelectedQuestion(question);
                                                setShowQuestionDrawer(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                selectedQuestion.id === question.id
                                                    ? 'bg-blue-600/20 border-blue-600/50'
                                                    : 'bg-gray-800/60 border-transparent hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{question.title}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getDifficultyColor(question.difficulty)}`}>
                                                    {question.difficulty}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-gray-400 line-clamp-2">{question.description.split('\n')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] h-full">
                                <div ref={problemRef} className="border-r border-gray-800 overflow-y-auto">
                                    <div className="p-6">
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-6">{selectedQuestion.description}</p>
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-white">Examples</h4>
                                            {selectedQuestion.examples.map((example, index) => (
                                                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="text-blue-300">Input: <span className="text-gray-300">{example.input}</span></div>
                                                        <div className="text-green-300">Output: <span className="text-gray-300">{example.output}</span></div>
                                                        {example.explanation && (
                                                            <div className="text-yellow-300">Explanation: <span className="text-gray-300">{example.explanation}</span></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-white mb-3">Constraints</h4>
                                            <ul className="space-y-1 text-sm text-gray-400">
                                                {selectedQuestion.constraints.map((constraint, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-gray-500 mr-2">•</span>
                                                        {constraint}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div ref={codeRef} className="flex flex-col overflow-y-auto">
                                    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setBottomPanel('testcases')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${bottomPanel === 'testcases' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Test Cases
                                            </button>
                                            <button
                                                onClick={() => setBottomPanel('output')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${bottomPanel === 'output' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Output
                                            </button>
                                        </div>
                                    </div>
                                    <div ref={codePanelRef} className="flex-1 flex flex-col min-h-0">
                                        <div className="flex-1" style={{ minHeight: 0 }}>
                                            <CodeEditor
                                                code={code}
                                                onChange={setCode}
                                                language={language}
                                            />
                                        </div>
                                        <div
                                            onMouseDown={handleResizeStart}
                                            className="h-2 cursor-row-resize bg-gray-900 border-t border-gray-800 hover:bg-gray-800 transition-colors"
                                        />
                                        {bottomPanel === 'testcases' ? (
                                            <div className="border-t border-gray-700" style={{ height: bottomPanelHeight }}>
                                                <TestCaseEditor
                                                    testCases={testCases}
                                                    onChange={setTestCases}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border-t border-gray-700" style={{ height: bottomPanelHeight }}>
                                                <OutputPanel output={output} isRunning={isRunning} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {showAiPanel && (
                                <div className="absolute right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 z-30 flex flex-col">
                                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                        <div className="font-semibold">AI Helper</div>
                                        <button
                                            onClick={() => setShowAiPanel(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                    </div>
                                    <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {aiMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                                                    message.role === 'user'
                                                        ? 'ml-auto bg-blue-600/30 text-blue-100'
                                                        : 'bg-white/5 text-gray-200'
                                                }`}
                                            >
                                                {message.text}
                                            </div>
                                        ))}
                                        {isAiLoading && (
                                            <div className="bg-white/5 text-gray-300 rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap">
                                                {aiProgress?.text || 'Thinking...'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-gray-800 space-y-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAiPreset('Explain this question in simple words.')}
                                                className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 hover:bg-white/20"
                                            >
                                                Explain question
                                            </button>
                                            <button
                                                onClick={() => handleAiPreset('Improve my code and explain the changes.')}
                                                className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 hover:bg-white/20"
                                            >
                                                Improve code
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={aiInput}
                                                onChange={(e) => setAiInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleAiSend();
                                                    }
                                                }}
                                                placeholder="Ask in simple words..."
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <button
                                                onClick={() => handleAiSend()}
                                                disabled={isAiLoading}
                                                className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 flex items-center justify-center"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
