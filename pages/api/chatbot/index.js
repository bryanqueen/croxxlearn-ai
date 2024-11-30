import OpenAI from 'openai';
import connectMongo from '@/lib/mongodb';
import Chat from '@/model/Chat';
import { verifyToken } from '@/lib/auth';
import User from '@/model/User';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Establish MongoDB connection outside of the request handler
let mongoConnection = null;

async function ensureMongoConnection() {
  if (!mongoConnection) {
    mongoConnection = await connectMongo();
  }
  return mongoConnection;
}

async function handler(req, res) {
  console.log('Received request:', req.method, req.url);


  try {
    //Ensure MongoDB connection is established before proceeding
    await ensureMongoConnection();
    console.log('Connected to MongoDB');

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
  
  
  //Handle the request based on the HTTP method
    switch (req.method) {
      case 'POST':
        return handlePostRequest(req, res);
      case 'GET':
        return handleGetRequest(req, res);
      case 'DELETE':
        return handleDeleteRequest(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateChatTitle(initialMessage) {
  try {
    console.log('Generating chat title');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Generate a short title (5 words or less) for a chat that starts with the following message.' },
        { role: 'user', content: initialMessage },
      ],
      max_tokens: 10,
      temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating chat title:', error);
    return 'New Chat';
  }
}

async function handlePostRequest(req, res) {
  console.log('Handling POST request');
  const { chatId, question, isNewChat } = req.body;
  console.log('Request body:', { chatId, question, isNewChat});

  try {
    // Check if user has enough credits
    if (req.user.credits < 0.5) {
      console.log('Insufficient credits');
      return res.status(403).json({ error: 'Insufficient credits' });
    }
    let chat;
    if (isNewChat || !chatId) {
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
          content: `You are an academic assistant for university students. Provide concise, accurate answers to academic questions. Focus on key points and avoid unnecessary details. 
          
          When using mathematical expressions, format them as follows:
          - For inline math, use \$$ and \$$ to enclose the expression. Example: The equation is \$$E = mc^2\$$.
          - For display (block) math, use \\[ and \\] to enclose the expression. Example: 
            The quadratic formula is:
            \\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]`,
        },
        ...chat.messages, // Include full conversation history
      ],
      stream: true,
    });

    console.log('OpenAI stream created');

    let aiMessage = { role: 'assistant', content: '' };

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        console.log('Sending chunk:', content);
        aiMessage.content += content;
        res.write(`data: ${JSON.stringify(content)}\n\n`);
      }
    }

    // Post-process the AI's response to ensure proper formatting
    aiMessage.content = aiMessage.content
      .replace(/\$\$(.*?)\$\$/g, (_, match) => `\\[${match}\\]`)
      .replace(/\$(.*?)\$/g, (_, match) => `\$$${match}\$$`);

    // Save the AI's response to the chat after the stream is complete
    chat.messages.push(aiMessage);
    await chat.save();

    // Deduct credits and update user
    req.user.credits -= 2;
    await req.user.save();

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

async function handleDeleteRequest(req, res) {
  const { chatId } = req.query;

  try {
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Error deleting chat' });
  }
}



export default handler;