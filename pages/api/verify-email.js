import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if(user.verificationOTP !== otp){
        return res.status(400).json({error: 'Invalid OTP'})
    }
    if (Date.now() > user.verificationOTPExpires) {
        return res.status(400).json({error: 'OTP expired'})
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set cookie with strict options
    res.setHeader('Set-Cookie', [
        `authToken=${token}; Path=/; Max-Age=3600; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    // Return the token in the response as well
    return res.status(200).json({ 
        message: 'Email verified successfully',
        token: token // Include token in response
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Server error' });
  }
}