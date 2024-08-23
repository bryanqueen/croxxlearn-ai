// pages/api/login.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
          });
      
          // Set the token in an HTTP-only cookie
          res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`);
      
          return res.status(200).json({ success: true, message: 'Login successful' });
        } else {
          res.setHeader('Allow', ['POST']);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
