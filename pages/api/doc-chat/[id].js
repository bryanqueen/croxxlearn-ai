import { verifyToken } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import DocChat from '@/model/DocChat';

export default async function handler(req, res) {
  const { id } = req.query;
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await verifyToken(token);
    await connectMongo();

    if (req.method === 'GET') {
      const docChat = await DocChat.findOne({ _id: id, userId: decoded.userId });
      if (!docChat) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.status(200).json(docChat);
    } else if (req.method === 'DELETE') {
      const result = await DocChat.deleteOne({ _id: id, userId: decoded.userId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.status(200).json({ message: 'Document deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}