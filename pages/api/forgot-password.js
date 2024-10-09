import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import { sendOTP } from '@/lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Save OTP to user document
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}