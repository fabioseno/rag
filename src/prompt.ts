import { readFile } from 'node:fs/promises';

export class Prompt {
    private static readonly promptsFolder = './prompts'
    private static files = {
        queryConverter: `${this.promptsFolder}/prompt-template.md`
    }

    static async getPromptTemplate(context: string, prompt: string, instructions: string = '') {
        const template = await readFile(this.files.queryConverter, 'utf-8');

        return template
            .replaceAll('{context}', context)
            .replaceAll('{prompt}', prompt)
            .replaceAll('{instructions}', instructions);
    }
}