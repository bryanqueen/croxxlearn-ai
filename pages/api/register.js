import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerifyOTP } from '@/lib/emailService';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  const { name, email, password, referralCode } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    const uniqueReferralCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Check referral code if provided
    let referredByUser;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
      if (!referredByUser) {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log('Generated OTP:', otp);
    const otpExpires = Date.now() + 3600000; // 1 hour from now

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      referralCode: uniqueReferralCode,
      isVerified: false,
      referredBy: referredByUser ? referredByUser._id : null,
      verificationOTP: otp.toString(),  // explicitly convert to string
      verificationOTPExpires: otpExpires
    });
    

    console.log('New user before save:', {
      email: newUser.email,
      verificationOTP: newUser.verificationOTP,       // use exact field name
      verificationOTPExpires: newUser.verificationOTPExpires
    });
    
    // Send OTP via email
    await sendVerifyOTP(email, otp);
    // Save new user
    await newUser.save();

    // After save
    const savedUser = await User.findOne({ email });
    console.log('User after save:', {
      email: savedUser.email,
      verificationOTP: savedUser.verificationOTP,     // use exact field name
      verificationOTPExpires: savedUser.verificationOTPExpires
    });


    // Update referrer's credits if applicable
    if (referredByUser) {
      referredByUser.credits += 100;
      await referredByUser.save();
    }


    console.log('User registered:', {
      email: newUser.email,
      otp: newUser.verificationOTP,
      otpExpires: newUser.verificationOTPExpires
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for the verification OTP.',
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during registration' });
  }
}