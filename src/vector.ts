import pg from 'pg';
import { OllamaProvider } from "./ollama-provider";

const { Client } = pg

export type VectorInfo = {
    id: string;
    type: string;
    description: string;
    itemData?: string;
    distance: number;
}
export class Vector {
    private dbClient: any;
    private embeddingModel;

    constructor(private readonly keepConnectionOpen: boolean = false) {
        this.embeddingModel = new OllamaProvider;
    }

    async storeData(id: string, type: string, description: string, vectorContent: string) {
        const vectorArray = await this.embeddingModel.embedContent(vectorContent);
        await this.saveVector(id, type, description, vectorContent, vectorArray);
    }

    async searchVectors(vector: number[], type: string): Promise<VectorInfo[]> {
        const client = await this.getDBClient();

        const sql = `SELECT id, type, description, item_data, 1 - (embedding <=> $1) as distance FROM vectors WHERE type = $2 ORDER BY distance DESC LIMIT 10;`;
        const values = [JSON.stringify(vector), type];

        try {
            const queryResult = await client.query(sql, values);
            return queryResult.rows.map((row: any) => ({
                id: row.id,
                type: row.type,
                description: row.description,
                itemData: row.item_data,
                distance: row.distance
            }));
        } catch (err) {
            console.error('Error querying data:', err);
            return [];
        } finally {
            await this.closeDBClient();
        }
    }

    public async closeDBClient() {
        if (this.dbClient && !this.keepConnectionOpen) {
            await this.dbClient.end();
        }
    }

    private async getDBClient() {
        if (this.dbClient && this.keepConnectionOpen) {
            return this.dbClient;
        }
        // Hey, this is just a sample. Don't be angry.
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'vector_db',
            password: 'password',
            port: 5433,
        });

        await client.connect();
        this.dbClient = client;

        return client;
    }

    private async saveVector(id: string, type: string, description: string, content: string, vectorArray: number[],) {
        const sql = 'INSERT INTO vectors (id, type, description, item_data, embedding) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, description = EXCLUDED.description, item_data = EXCLUDED.item_data, embedding = EXCLUDED.embedding';
        const values = [id, type, description, content, JSON.stringify(vectorArray)];
        const client = await this.getDBClient();

        try {
            await client.query(sql, values);
        } catch (err) {
            console.error('Error inserting data:', err);
        } finally {
            await this.closeDBClient();
        }
    }
}