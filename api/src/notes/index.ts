// 1. define a take notes function
// 2. takes a PDF, processes it in unstructured
// 3. gets back it in langchain
// 4. write prompts to feed to langchain
// 5. pipe language with prompt, openaimodel, and langchain
// 6. write an express server to get back those results and store it in supabase
// 7. create a supabase key and write 3 tables to it
// 8. generate embeddings from the paper
// 9.

import axios from "axios";
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";
import { PDFDocument } from "pdf-lib";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const loadPaperFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return response.data;
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

  const documents = await loader.load();

  await unlink(`pdfs/${randomName}.pdf`);
  return documents;
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

  if (pagesToDelete && pagesToDelete.length > 0) {
    pdfBuffer = await deletePages(pdfBuffer, pagesToDelete);
  }

  // load this into unstructured loader by convertedPDFtolangchainDocuments
  const documents = await convertPDFtoDocuments(pdfBuffer);

  // generate notes from this
  // const notes = await generateNotes(documents)
};

await takeNotes({
  paperUrl: "https://arxiv.org/pdf/2305.15334.pdf",
  name: "test",
});
