
import OpenAI from 'openai';
import { PDFExtract } from 'pdf.js-extract';
import mammoth from 'mammoth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pdfExtract = new PDFExtract();

export async function processDocument(file, fileContent) {
  const fileType = file.originalFilename.split('.').pop().toLowerCase();
  let text = '';

  switch (fileType) {
    case 'pdf':
      text = await processPDF(fileContent);
      break;
    case 'docx':
      text = await processDocx(fileContent);
      break;
    case 'txt':
      text = fileContent.toString('utf-8');
      break;
    default:
      throw new Error('Unsupported file type');
  }

  return text;
}

async function processPDF(fileContent) {
  const data = await pdfExtract.extractBuffer(fileContent);
  return data.pages.map(page => page.content).join(' ');
}

async function processDocx(fileContent) {
  const result = await mammoth.extractRawText({ buffer: fileContent });
  return result.value;
}

export async function generateSummaries(text) {
  const chunkSize = 4000; // Adjust based on OpenAI's token limit
  const chunks = chunkText(text, chunkSize);
  const summaries = [];

  console.log(chunks)

  for (const chunk of chunks) {
    const prompt = `Summarize the following text, focusing on key points and main ideas:\n\n${chunk}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant tasked with summarizing academic content. Provide concise, informative summaries that capture the main ideas and key points of the given text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500
    });

    summaries.push({
      title: `Summary ${summaries.length + 1}`,
      content: completion.choices[0].message.content.trim()
    });
  }

  return summaries;
}

function chunkText(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}