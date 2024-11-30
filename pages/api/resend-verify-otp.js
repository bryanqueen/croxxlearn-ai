import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import { sendVerifyOTP } from '@/lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { email } = req.body;

  try {
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(404).json({ message: 'User not found or already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.verificationOTP = otp;
    user.verificationOTPExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // Send new OTP via email
    await sendVerifyOTP(email, otp);

    res.status(200).json({ message: 'New OTP sent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
}