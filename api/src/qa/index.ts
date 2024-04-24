// this takes in a question and returns answers + followup questions
// there is a function that has an

import { SupabaseDatabase } from "database.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ArxivPaperNote } from "notes/prompt.js";
import { Document } from "langchain/document";
import {
  ANSWER_QUESTION_TOOL_SCHEMA,
  QA_OVER_PAPER_PROMPT,
  answerOutputParser,
} from "./prompt.js";
import { formatDocumentsAsString } from "langchain/util/document";

const QaModel = (
  documents: Document[],
  question: string,
  notes: Array<ArxivPaperNote>
) => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.0,
  });

  const modelWithTool = model.bind({
    tools: [ANSWER_QUESTION_TOOL_SCHEMA],
    tool_choice: "auto",
  });

  const chain =
    QA_OVER_PAPER_PROMPT.pipe(modelWithTool).pipe(answerOutputParser);

  const response = chain.invoke({
    notes,
    relevantDocuments: documents,
    question: question,
  });

  return response;
};

export const qaOnPaper = async (question: string, paperUrl: string) => {
  // 1. create a database from supabase
  // 2. get back documents by performing a vectorStore similarity search on question
  // 3. get notes by calling database.getPaper
  // 4. call QaModel with the question, answer, and documents
  // 4. save the qustion and answer to the database
  // 5. return the response of QaModel

  const database = await SupabaseDatabase.fromExistingIndex();

  const documents = await database.vectorStore.similaritySearch(question, 8, {
    url: paperUrl,
  });

  const notes = await database.getPaper(paperUrl);

  // 1. write QA method
  const questionAndResponse = await QaModel(
    documents,
    question,
    notes as unknown as Array<ArxivPaperNote>
  );

  console.log(questionAndResponse, "questionAndResponse");

  // 2. add saveQA method to database.qa
  await Promise.all(
    questionAndResponse.map(async (qa) => {
      await database.saveQa(
        question,
        qa.answer,
        qa.followupQuestions,
        formatDocumentsAsString(documents)
      );
    })
  );

  return questionAndResponse;
};
