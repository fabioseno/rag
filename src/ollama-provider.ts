import axios from "axios";
import { LogMode } from "./main";

export class OllamaProvider {
    private readonly ollamaEndpoint = 'http://localhost:11434/api';
    private embeddingModel = 'nomic-embed-text';
    // private embeddingModel = 'all-minilm:33m';
    // private embeddingModel = 'llama3.2:3b';
    // private promptModel = 'llama3.2';
    // private promptModel = 'gemma:2b';
    // private promptModel = 'mistral:7b';
    private promptModel = 'tinyllama';

    constructor(public readonly logMode: LogMode = LogMode.None) { }

    async embedContent(data: string): Promise<number[]> {
        const payload = JSON.stringify({
            "model": this.embeddingModel,
            "input": data
        });

        if (this.logMode === LogMode.LogAll) {
            console.log('Embedding', payload);
        }

        const embedding = await axios.post(`${this.ollamaEndpoint}/embed`, payload)
            .then((response: any) => {
                return response.data.embeddings[0] as number[];
            })
            .catch((error: any) => {
                console.error('Error making the HTTP request:', error.error);
                return [] as number[];
            });

        return embedding;
    }

    async prompt(context: string, question: string): Promise<string> {
        const prompt = {
            "model": this.promptModel,
            "stream": false,
            "prompt": `
          Context:
          ${context}
  
          Answer this question:
          ${question}
        `
        };

        if (this.logMode === LogMode.LogAll) {
            console.log('Prompt', prompt);
        }

        const text = await axios.post(`${this.ollamaEndpoint}/generate`, prompt)
            .then((response: any) => {
                return response.data.response as string;
            })
            .catch((error: any) => {
                console.error('Error making the HTTP request:', error);
                return '';
            });

        return text;
    }
}