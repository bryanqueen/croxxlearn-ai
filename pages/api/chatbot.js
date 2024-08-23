import OpenAI from 'openai';
import { requireAuth } from '@/middleware/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req, res) {
  if (req.method === 'POST') {
    const { question } = req.body;

    console.log('Received question:', question);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: question },
        ],
        stream: true,
      });

      completion.on('data', (data) => {
        console.log('Streaming data:', data); // Debugging line
        res.write(`data: ${data.choices[0].delta.content}\n\n`);
      });

      completion.on('end', () => {
        console.log('Stream ended'); // Debugging line
        res.end();
      });
    } catch (error) {
      console.error('Error fetching response:', error); // Debugging line
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
export default handler