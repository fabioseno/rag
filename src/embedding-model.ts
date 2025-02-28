import chalk from 'chalk';
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

    async queryModel(text: string, type: string = 'custom', returnContent: boolean = false): Promise<VectorInfo[]> {
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

    async generateAnswer(question: string, type: string = 'custom', promptInstructions: string = ''): Promise<string> {
        console.log(chalk.green(`\n[1/6] Embedding the question and performing a vector search in the database`));
        console.log(chalk.yellow(`${question}`));

        const result = await this.queryModel(question, type, true);
        let promptText = result[0]?.itemData;
        console.log(chalk.green(`\n[2/6] Most relevant result returned from the DB`));
        console.log(chalk.yellow(promptText));

        console.log(chalk.green('\n[3/6] Processing the answer...\n'));
        const output = await this.model.prompt(promptText!, question);

        console.log(chalk.green('\n[4/6] Model answer:'));
        console.log(chalk.yellow(output));

        console.log(chalk.green(`\n[5/6] Now processing the answer with custom instruction in the prompt...`));
        console.log(chalk.green(`Custom instructions: ${chalk.yellow(promptInstructions)}`));

        const newOutput = await this.model.prompt(promptText!, question, promptInstructions);
        console.log(chalk.green('\n[6/6] New answer:'));
        console.log(chalk.yellow(newOutput));

        return output;
    }

}