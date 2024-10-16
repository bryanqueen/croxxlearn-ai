
import { verifyToken } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import DocChat from '@/model/DocChat';
import User from '@/model/User';
import { processDocument, generateSummaries } from '@/lib/documentProcessor';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await verifyToken(token);
    await connectMongo();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits < 10) {
      return res.status(403).json({ error: 'Insufficient credits' });
    }

    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0]; // Access the first file in the 'file' field
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = await fs.readFile(file.filepath);
    const processedContent = await processDocument(file, fileContent);
    const summaries = await generateSummaries(processedContent);

    // Here you would typically save the file to a permanent storage
    // For now, we'll just use the temporary path
    const fileUrl = file.filepath;

    const newDocChat = new DocChat({
      userId: user._id,
      title: file.originalFilename,
      fileUrl: fileUrl,
      summaries: summaries,
    });

    await newDocChat.save();

    // Deduct credits
    user.credits -= 10;
    await user.save();

    res.status(200).json({ document: newDocChat, updatedCredits: user.credits });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}