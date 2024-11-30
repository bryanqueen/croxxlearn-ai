import { verifyToken } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import DocChat from '@/model/DocChat';
import User from '@/model/User';
import OpenAI from 'openai';
import { findMostRelevantText } from '@/lib/vectorSearch'; // Implement this function

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { docId, message } = req.body;
  const token = req.cookies.authToken;

  if (!token || !docId || !message) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  try {
    const decoded = await verifyToken(token);
    await connectMongo();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < 1.5) {
      return res.status(403).json({ error: 'Insufficient credits' });
    }
    const docChat = await DocChat.findOne({ _id: docId, userId: user._id });
    if (!docChat) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Prepare conversation history
    const conversationHistory = docChat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add user's new message
    conversationHistory.push({ role: 'user', content: message });

    // Find most relevant text from the full document
    const relevantText = await findMostRelevantText(docChat.fullText, message, 2000); // Limit to 2000 characters

    // Prepare document context
    const documentContext = `
      Document Title: ${docChat.title}
      Relevant Content: ${relevantText}
      
      Summary: ${docChat.summaries.map(summary => summary.content).join('\n\n')}
    `;

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: 'system', 
          content: `You are an AI assistant helping with queries related to a specific document. 
                    Here's the relevant content and summary of the document:
                    ${documentContext}
                    
                    Please answer questions based on this document content. If a question is not related to the document, 
                    politely inform the user that the question is outside the scope of the current document and ask if they 
                    have any questions about the document's content.`
        },
        ...conversationHistory
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    // Save messages to database
    docChat.messages.push({ role: 'user', content: message });
    docChat.messages.push({ role: 'assistant', content: aiResponse });
    await docChat.save();

    // Deduct credits
    user.credits -= 3;
    await user.save();

    res.status(200).json({ message: aiResponse, updatedCredits: user.credits });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}