import OpenAI from 'openai';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  try {
    const data = await pdf(fileContent);
    return data.text;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF file');
  }
}

async function processDocx(fileContent) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileContent });
    return result.value;
  } catch (error) {
    console.error('Error processing DOCX:', error);
    throw new Error('Failed to process DOCX file');
  }
}

export async function generateSummaries(text) {
  const chunkSize = 4000; // Adjust based on OpenAI's token limit
  const chunks = chunkText(text, chunkSize);
  const summaries = [];

  console.log('Chunks:', chunks.map(chunk => chunk.substring(0, 100) + '...')); // Log first 100 characters of each chunk

  for (const chunk of chunks) {
    const prompt = `Summarize the following text, focusing on key points and main ideas:\n\n${chunk}`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an AI assistant tasked with summarizing academic content. Provide concise, informative summaries that capture the main ideas and key points of the given text." },
          { role: "user", content: prompt }
        ],
        max_tokens: 10000
      });

      summaries.push({
        title: `Summary ${summaries.length + 1}`,
        content: completion.choices[0].message.content.trim()
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      summaries.push({
        title: `Summary ${summaries.length + 1}`,
        content: 'Error generating summary for this section.'
      });
    }
  }

  return summaries;
}

function chunkText(text, chunkSize) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).length <= chunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}