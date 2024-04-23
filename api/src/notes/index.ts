// 1. define a take notes function
// 2. takes a PDF, processes it in unstructured
// 3. gets back it in langchain
// 4. write prompts to feed to langchain
// 5. pipe language with prompt, openaimodel, and langchain
// 6. write an express server to get back those results and store it in supabase
// 7. create a supabase key and write 3 tables to it
// 8. generate embeddings from the paper
// 9. added /
// 10. fixing this error:
// Error: Failed to partition file pdfs/yqmv6.pdf with error 503 and message upstream connect error or disconnect/reset before headers. reset reason: connection timeout

import axios from "axios";
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";
import { PDFDocument } from "pdf-lib";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { Document } from "langchain/document";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  ArxivPaperNotes,
  NOTES_TOOL_SCHEMA,
  NOTE_PROMPT,
  noteOutputParser,
} from "./prompt.js";
// import textract from "textract"
// @ts-ignore
import textract from "textract";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { v4 as uuidv4 } from "uuid";

const loadPaperFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return response.data;
};

// const save

const savePaperFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const randomName = uuidv4(); // Generate a random name
  const filePath = path.join("pdfs", `${randomName}.pdf`);

  await writeFile(filePath, response.data, "binary");

  console.log(`PDF saved to: ${filePath}`);

  return filePath; // Return the file path where the PDF is saved
};

const deletePages = async (pdf: Buffer, pagesToDelete: Array<number>) => {
  const counter = 0;
  const pdfBuffer = await PDFDocument.load(pdf);
  let numOffsetBy = 0;
  for (const pageNum of pagesToDelete) {
    pdfBuffer.removePage(pageNum - numOffsetBy);
    numOffsetBy++;
  }

  const pdfBytes = await pdfBuffer.save();
  return Buffer.from(pdfBytes);
};

const convertPDFtoDocuments = async (pdf: Buffer) => {
  // 1. if missing api key throw error
  // 2. generate randomname
  // 3. write pdfbuffer to a file
  // 4. instantiate a new unstructured loader
  // 5. call loader.load()
  // 6. unlink pdf
  // 7. return langchainDocument

  if (!process.env.UNSTRUCTURED_API_KEY) {
    throw new Error("missing UNSTRUCTURED_API_KEY");
  }

  const randomName = Math.random().toString(36).substring(7);

  const filePath = path.join("pdfs", `${randomName}.pdf`);

  // Ensure the directory exists before writing the file
  await mkdir("pdfs", { recursive: true });
  await writeFile(filePath, pdf, "binary");

  const loader = new UnstructuredLoader(`pdfs/${randomName}.pdf`, {
    apiKey: process.env.UNSTRUCTURED_API_KEY,
    strategy: "hi_res",
    apiUrl:
      "https://postcovet-ceq6kl5n.api.unstructuredapp.io/general/v0/general",
  });

  console.log("does it go here?");

  const documents = await loader.load();

  console.log("what is the error?");

  await unlink(`pdfs/${randomName}.pdf`);
  return documents;
};

const convertPDFtoDocuments2 = async (name: string, pdf: Buffer) => {
  console.log(name, "name");
  console.log(pdf, "pdf");

  textract.fromBufferWithName(
    name,
    pdf,
    function (error: string, text: string) {
      if (error) {
        console.log(error, "error!");
      }
      console.log(text, "text");
    }
  );
};

// using https://github.com/dbashford/textract
// to extract text from documents here
const convertedPDFtoDocuments3 = async (filePath: string) => {
  return new Promise((resolve, reject) => {
    const currentWorkingDirectory = process.cwd();
    console.log("Current working directory:", currentWorkingDirectory);

    textract.fromFileWithPath(
      filePath,
      async function (error: string, text: string) {
        if (error) {
          console.log(error, "error!");
          reject(error);
        }

        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 1,
        });

        const output = await splitter.createDocuments([text]);

        resolve(output);
      }
    );
  });
};

const convertedPDFtoDocuments4 = async (
  filePath: string,
  documentPerPage = true
) => {
  // one documentPerPage
  let loader;
  if (documentPerPage) {
    loader = new PDFLoader(filePath);
  } else {
    // one document per file
    // hypothesis: this is too big to fit into the openai's conext window since it has 42954 characters
    //  'to verify and evaluate. API calls, '... 42954 more characters,
    // where the context window for openai3.5 is 18k
    loader = new PDFLoader(filePath, {
      splitPages: false,
    });
  }
  const docs = await loader.load();

  return docs;
};

const generateNotes = async (
  documents: Document[]
): Promise<Array<ArxivPaperNotes>> => {
  // 1. format Documents as string

  const documentsAsString = formatDocumentsAsString(documents);

  console.log("1. documents as string", documentsAsString);

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.0,
    maxTokens: 16385,
  });

  const modelWithTool = model.bind({
    tools: [NOTES_TOOL_SCHEMA],
  });

  const chain = NOTE_PROMPT.pipe(modelWithTool).pipe(noteOutputParser);

  const response = chain.invoke({
    paper: documentsAsString,
  });

  return response;
};

const takeNotes = async ({
  paperUrl,
  name,
  pagesToDelete,
}: {
  paperUrl: string;
  name: string;
  pagesToDelete?: Array<number>;
}) => {
  // get the pdf and use unstructured to turn it into langchain document
  // const unstructred = new UnstructuredLoader("./pdf/notes", "utf-8");
  // 1. load paperFromUrl by defining a function and passing in the paperUrl
  // 2. delete pages that are uncessary

  let pdfBuffer = await loadPaperFromUrl(paperUrl);

  let pdf = await savePaperFromUrl(paperUrl);

  // if (pagesToDelete && pagesToDelete.length > 0) {
  //   pdfBuffer = await deletePages(pdfBuffer, pagesToDelete);
  // }

  // load this into unstructured loader by convertedPDFtolangchainDocuments
  // const documents = await convertPDFtoDocuments(pdfBuffer);
  // const documents = await convertPDFtoDocuments2("gorilla", pdfBuffer);

  // const
  // write documents to a file
  // const fileName = "test1.json";
  // const jsonContent = JSON.stringify(documents, null, 2);
  // await writeFile(fileName, jsonContent, "utf-8");
  // console.log(`Documents written to ${fileName} successfully.`);

  // generate notes from this
  const notes = await convertedPDFtoDocuments4(pdf);

  console.log(notes, "notes");

  // what do i do after getting notes?
  // 1. create new documents with metadata for the paperURL
  // 2. save it to the database
  // 3. return notes
  // const newDocs: Array<Document> = documents.map((doc) => {
  //   return {
  //     ...doc,
  //     metadata: {
  //       ...doc.metadata,
  //       url: paperUrl,
  //     },
  //   };
  // });

  // const database = await

  // console.log(notes, "notes");

  // return notes;
};

await takeNotes({
  paperUrl: "https://arxiv.org/pdf/2305.15334.pdf",
  name: "test",
});

// const output = await convertedPDFtoDocuments3(`src/pdfs/6l5ve.pdf`);
// console.log(output);

// console.log(await convertedPDFtoDocuments4(`src/pdfs/6l5ve.pdf`, true));
