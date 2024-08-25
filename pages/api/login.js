
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/model/User';

export default async function handler(req, res) {
  console.log('Login API called');
  await dbConnect();

  if (req.method === 'POST') {
    console.log('POST request received');
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');

      if (user && (await bcrypt.compare(password, user.password))) {
        console.log('Password matched');
        const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, {
          expiresIn: '1h', // Token expires in 1 hour
        });

        console.log('JWT created');

        // Set the token in an HTTP-only cookie
        const cookieOptions = [
          `authToken=${token}`,
          'Path=/',
          'Max-Age=3600',
          'SameSite=Lax',
        ];

        // Add Secure flag if not in development
        if (process.env.NODE_ENV === 'production') {
          cookieOptions.push('Secure');
        }

        res.setHeader('Set-Cookie', cookieOptions.join('; '));
        console.log('Cookie set:', cookieOptions.join('; '));

        return res.status(200).json({ success: true, message: 'Login successful', token: token });
      } else {
        console.log('Invalid credentials');
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  } else {
    console.log(`Method ${req.method} not allowed`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}