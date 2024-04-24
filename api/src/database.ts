// 1. make a supabase database class
// 2. return a vectorstore and a client
// 3. constructor
// 4. make a from documents class
// 5. this takes in the documents and generates embeddings from it
import { Document } from "langchain/document";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Database } from "generated/db.js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ArxivPaperNote } from "notes/prompt.js";

export const ARXIV_EMBEDDINGS_TABLE = "arxiv_embeddings";
export const ARXIV_PAPERS_TABLE = "arxiv_papers";
export const ARXIV_QUESTION_ANSWERING = "arxiv_question_answering";

export class SupabaseDatabase {
  client: SupabaseClient<Database, "public", any>;
  vectorStore: SupabaseVectorStore;

  constructor(
    client: SupabaseClient<Database, "public", any>,
    vectorStore: SupabaseVectorStore
  ) {
    this.client = client;
    this.vectorStore = vectorStore;
  }

  // async addPaper({ documents }) {
  //   // check if supabase api keys are here
  //   if (!process.env.supabase_api) {
  //     throw new Error("missing supabase api keys");
  //   }

  //   // generate embeddings from this
  // }

  static async fromExistingIndex() {
    const privateKey = process.env.SUPABASE_PRIVATE_KEY;
    const projectUrl = process.env.SUPABASE_URL;

    if (!privateKey || !projectUrl) {
      throw new Error("missing supabase credentials");
    }

    const client = createClient<Database>(projectUrl, privateKey);

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        client: client,
        tableName: ARXIV_EMBEDDINGS_TABLE,
        queryName: "match_documents",
      }
    );

    return new this(client, vectorStore);
  }

  static async fromDocuments(documents: Document[]) {
    // 0. first check that there is a supabase api key and url
    // 1. pass in an array of documents
    // 2. generate embeddings from this
    // 3. create a client
    // 4. create a vectorStore
    // 5. initialize this class and return

    const privateKey = process.env.SUPABASE_PRIVATE_KEY;
    const projectUrl = process.env.SUPABASE_URL;

    if (!privateKey || !projectUrl) {
      throw new Error("missing supabase credentials");
    }

    const client = createClient<Database>(projectUrl, privateKey);

    const vectorStore = await SupabaseVectorStore.fromDocuments(
      documents,
      new OpenAIEmbeddings(),
      {
        client: client,
        tableName: ARXIV_EMBEDDINGS_TABLE,
        queryName: "match_documents",
      }
    );

    return new this(client, vectorStore);
  }

  async getPaper(
    paperUrl: string
  ): Promise<Database["public"]["Tables"]["arxiv_papers"]["Row"] | null> {
    const { data, error } = await this.client
      .from(ARXIV_PAPERS_TABLE)
      .select()
      .eq("arxiv_url", paperUrl);

    if (error || !data) {
      console.error("error getting paper from the database");
      return null;
    }

    return data[0];
  }

  async addPaper({
    paperUrl,
    name,
    notes,
    paper,
  }: {
    paperUrl: string;
    name: string;
    notes: ArxivPaperNote[];
    paper: string;
  }) {
    const { data, error } = await this.client.from(ARXIV_PAPERS_TABLE).insert({
      arxiv_url: paperUrl,
      name,
      notes,
      paper,
    });

    if (error) {
      throw new Error("error inserting paper to database");
    }

    return data;
  }
}
