import OpenAI from 'openai';
import connectMongo from '@/lib/mongodb';
import Chat from '@/model/Chat';
import { verifyToken } from '@/lib/auth';
import User from '@/model/User';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handler(req, res) {
  console.log('Received request:', req.method, req.url);

  function extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
  
  const token = extractToken(req);
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.log('Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    console.log('User authenticated:', user._id);
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }

  await connectMongo();
  console.log('Connected to MongoDB');

  switch (req.method) {
    case 'POST':
      return handlePostRequest(req, res);
    case 'GET':
      return handleGetRequest(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function generateChatTitle(initialMessage) {
  try {
    console.log('Generating chat title');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate a short title (5 words or less) for a chat that starts with the following message.' },
        { role: 'user', content: initialMessage },
      ],
      max_tokens: 10,
      temperature: 0.7,
    });

    const title = response.choices[0].message.content.trim();
    console.log('Generated title:', title);
    return title;
  } catch (error) {
    console.error('Error generating chat title:', error);
    return 'New Chat';
  }
}

async function handlePostRequest(req, res) {
  console.log('Handling POST request');
  const { messages, chatId, question } = req.body;
  console.log('Request body:', { messages, chatId, question });

  try {
    let chat;
    if (!chatId) {
      // Create a new chat for the first question
      console.log('Creating new chat');
      const title = await generateChatTitle(question);
      chat = new Chat({
        title,
        messages: [{ role: 'user', content: question }],
        user: req.user._id,
      });
      await chat.save();
      console.log('New chat created:', chat._id);
    } else {
      // Use existing chat
      console.log('Using existing chat:', chatId);
      chat = await Chat.findOne({ _id: chatId, user: req.user._id });
      if (!chat) {
        console.log('Chat not found');
        return res.status(404).json({ error: 'Chat not found' });
      }
      chat.messages.push({ role: 'user', content: question });
      await chat.save();
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Send the chat ID to the client
    res.write(`data: ${JSON.stringify({ chatId: chat._id })}\n\n`);

    // Process the question with OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an academic assistant for university students. Provide concise, accurate answers to academic questions. Focus on key points and avoid unnecessary details.',
        },
        ...chat.messages, // Include full conversation history
      ],
      stream: true,
    });

    console.log('OpenAI stream created');

    const aiMessage = { role: 'assistant', content: '' };

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        console.log('Sending chunk:', content);
        aiMessage.content += content;
        res.write(`data: ${content}\n\n`);
      }
    }

    // Save the AI's response to the chat
    chat.messages.push(aiMessage);
    await chat.save();

    console.log('Stream completed');
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error processing request:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}


async function handleGetRequest(req, res) {
  console.log('Handling GET request');
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    console.log('Fetched chats:', chats.length);
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Error fetching chats' });
  }
}



export default handler;