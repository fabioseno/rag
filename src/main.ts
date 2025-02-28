import { EmbeddingModel } from "./embedding-model";

export enum LogMode {
  LogAll,
  None
}

class Test {
  private embeddingModel;

  constructor() {
    this.embeddingModel = new EmbeddingModel(LogMode.None);
  }

  async execute() {
    await this.seedDatabase();
    const answer = await this.embeddingModel.generateAnswer('Which company is gonna spend $500 billion in U.S investments?', 'news');
    console.log(answer);
  }

  private seedDatabase() {
    // seeding the database  
    return Promise.allSettled([
      this.embeddingModel.addContent(`Demand for Nvidia's pricey artificial intelligence chips will be in focus when the company reports results on Wednesday as investors doubt the hefty spending on the technology after low-cost AI models from China's DeepSeek rattled the industry.
        The world's second most valuable company has been the top beneficiary of an AI-driven spending spree by big technology companies over the past two years.
        But claims that DeepSeek's AI models rival its Western counterparts at a fraction of the cost has led some investors to ask if Nvidia's cutting-edge chips are essential for gaining an edge in AI race.`, {
        id: '8d44e5b8-ed0c-49ec-94a0-4397e091ebdb'
      }),
      this.embeddingModel.addContent(`The billionaire's Starlink communications network is facing increasingly stiff challenges to its dominance of high-speed satellite internet, including from a Chinese state-backed rival and another service financed by Amazon.com (AMZN.O), opens new tab founder Jeff Bezos.
            Shanghai-based SpaceSail in November signed an agreement to enter Brazil and announced it was in talks with over 30 countries. Two months later, it began work in Kazakhstan, according to the Kazakh embassy in Beijing.`, {
        id: 'b5a95af0-4700-405a-9af0-df29d642c56a'
      }),
      this.embeddingModel.addContent(`Apple (AAPL.O), opens new tab said on Monday it would spend $500 billion in U.S. investments in the next four years that will include a giant factory in Texas for artificial intelligence servers and add about 20,000 research and development jobs across the country in that time.
                That $500 billion in expected spending includes everything from purchases from U.S. suppliers to U.S. filming of television shows and movies for its Apple TV+ service. The company declined to say how much of the figure it was already planning to spend with its U.S. supply base, which includes firms such as Corning (GLW.N), opens new tab that makes glass for iPhones in Kentucky.`, {
        id: '590237db-da68-4619-b360-686cf098ccea'
      })
    ]);

  }
}


const test = new Test();
test.execute();