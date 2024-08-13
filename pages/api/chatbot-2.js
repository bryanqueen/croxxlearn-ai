// import { LLMApi } from '@huggingface/transformers';

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { question } = req.body;

//     console.log('Received question:', question);

//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     try {
//       const llm = new LLMApi({
//         model: 'decapoda-research/llama-7b-hf',
//       });

//       const response = await llm.generate({
//         inputs: question,
//         max_new_tokens: 50,
//         do_sample: true,
//         top_k: 50,
//         top_p: 0.95,
//         num_return_sequences: 1,
//       });

//       res.write(`data: ${response.generated_text}\n\n`);
//       res.end();
//     } catch (error) {
//       console.error('Error fetching response:', error);
//       res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
//       res.end();
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' });
//   }
// }

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { question } = req.body;

    console.log('Received question:', question);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/decapoda-research/llama-3',
        { inputs: question },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Set your Hugging Face API key here
          },
        }
      );

      const generatedText = response.data[0].generated_text; // Adjust based on the actual response structure
      res.write(`data: ${generatedText}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error fetching response:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}