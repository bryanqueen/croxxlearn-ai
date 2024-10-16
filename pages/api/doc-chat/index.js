import { verifyToken } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import DocChat from '@/model/DocChat';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await verifyToken(token);
    await connectMongo();

    const docChats = await DocChat.find({ userId: decoded.userId }).sort({ updatedAt: -1 });
    res.status(200).json(docChats);
  } catch (error) {
    console.error('Error fetching doc-chats:', error);
    res.status(500).json({ error: 'Failed to fetch doc-chats' });
  }
}