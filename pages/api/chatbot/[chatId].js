import connectMongo from '@/lib/mongodb';
import Chat from '@/model/Chat';
import { verifyToken } from '@/lib/auth';
import { Types } from 'mongoose';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      await connectMongo();

      const { chatId } = req.query;
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      try {
        const decodedToken = await verifyToken(token);
        if (!decodedToken || !decodedToken.userId) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        if (!Types.ObjectId.isValid(chatId)) {
          return res.status(400).json({ error: 'Invalid chat ID' });
        }

        const result = await Chat.findOneAndDelete({
          _id: new Types.ObjectId(chatId),
          user: new Types.ObjectId(decodedToken.userId)
        });

        if (result) {
          res.status(200).json({ message: 'Chat deleted successfully' });
        } else {
          res.status(404).json({ error: 'Chat not found' });
        }
      } catch (verificationError) {
        console.error('Token verification failed:', verificationError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Error deleting chat' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}