import { v4 as uuidV4 } from 'uuid';
import { LogMode } from "./main";
import { OllamaProvider } from "./ollama-provider";
import { Vector, VectorInfo } from "./vector";

export class EmbeddingModel {
    private model;

    constructor(public readonly logMode: LogMode = LogMode.None) {
        this.model = new OllamaProvider(logMode)
    }

    public async addContent(content: string,
        options?: {
            id?: string;
            type?: string;
            description?: string;

        }) {
        const vector = new Vector();
        await vector.storeData(
            options?.id || uuidV4(),
            options?.type || 'custom',
            options?.description || '',
            content);

        console.log('Content added');
    }

    async queryModel(text: string, type: string, returnContent: boolean = false): Promise<VectorInfo[]> {
        const vector = new Vector();

        const vectorArray = await this.model.embedContent(text);
        const rows = await vector.searchVectors(vectorArray, type);
        let output = rows;

        if (!returnContent) {
            output = rows.map(row => ({
                id: row.id,
                type: row.type,
                description: row.description,
                distance: row.distance
            }));
        }

        if (this.logMode === LogMode.LogAll) {
            console.log('Sorted vectors output', output);
        }

        return output;
    }

    async generateAnswer(question: string, type: string): Promise<string> {
        console.log(`[Prompting 1/3] - ${question}`);
        const result = await this.queryModel(question, type, true);
        console.log(`[Prompting 2/3] - Preparing the answer`);

        let promptText = result.map(row => row.itemData).join('\n\n');
        const output = await this.model.prompt(promptText, question);

        console.log('[Prompting 3/3]: ', output);
        return output;
    }

}