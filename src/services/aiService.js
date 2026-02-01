import { CreateMLCEngine, prebuiltAppConfig } from "@mlc-ai/web-llm";

// Default model to use (Qwen 2.5 1.5B is a good balance of speed/quality for web)
const DEFAULT_MODEL = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

class AIService {
    constructor() {
        this.engine = null;
        this.modelId = DEFAULT_MODEL;
        this.initialized = false;
        this.initializationPromise = null;
        this.progressCallback = null;
    }

    /**
     * Set a callback to receive download progress updates
     * @param {function} callback - Function receiving { progress: number, text: string }
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    /**
     * Initialize the WebLLM engine
     */
    async init() {
        if (this.initialized) return;
        if (this.initializationPromise) return this.initializationPromise;

        this.initializationPromise = this._doInit();
        return this.initializationPromise;
    }

    async _doInit() {
        try {
            console.log("Initializing WebLLM with model:", this.modelId);
            
            this.engine = await CreateMLCEngine(this.modelId, {
                initProgressCallback: (report) => {
                    console.log(`[WebLLM] ${report.text} (${Math.round(report.progress * 100)}%)`);
                    if (this.progressCallback) {
                        this.progressCallback({
                            progress: report.progress,
                            text: report.text
                        });
                    }
                },
                appConfig: {
                    ...prebuiltAppConfig,
                    useIndexedDBCache: true,
                },
            });

            this.initialized = true;
            console.log("WebLLM Initialized successfully");
        } catch (error) {
            console.error("WebLLM Initialization failed:", error);
            this.initializationPromise = null;
            throw error;
        }
    }

    /**
     * Generate a response for a given chat history
     * @param {Array} messages - Array of { role: 'user'|'assistant'|'system', content: string }
     * @param {function} onChunk - Optional callback for streaming response
     */
    async chat(messages, onChunk = null) {
        await this.init();

        try {
            const stream = !!onChunk;
            
            if (stream) {
                const chunks = await this.engine.chat.completions.create({
                    messages,
                    stream: true,
                    temperature: 0.7,
                    max_tokens: 1024,
                });

                let fullResponse = "";
                for await (const chunk of chunks) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        fullResponse += content;
                        onChunk(content);
                    }
                }
                return fullResponse;
            } else {
                const response = await this.engine.chat.completions.create({
                    messages,
                    stream: false,
                    temperature: 0.7,
                    max_tokens: 1024,
                });
                return response.choices[0]?.message?.content || "";
            }
        } catch (error) {
            console.error("AI Chat generation failed:", error);
            throw error;
        }
    }

    /**
     * Check if the engine is ready
     */
    isReady() {
        return this.initialized;
    }
}

export const aiService = new AIService();
