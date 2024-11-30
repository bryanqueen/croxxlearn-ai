import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerifyOTP } from '@/lib/emailService';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  const { name, email, password, referralCode, googleId } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (googleId && !existingUser.googleId) {
        // If it's a Google sign-in and the user exists but doesn't have a Google ID, update the user
        existingUser.googleId = googleId;
        existingUser.isVerified = true; // Google accounts are considered verified
        await existingUser.save();
        
        // Generate JWT token
        const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });

        return res.status(200).json({
          success: true,
          message: 'Google account linked successfully',
          token,
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            isVerified: existingUser.isVerified,
          },
        });
      } else {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
    }

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

    let hashedPassword;
    let isVerified = false;
    let verificationOTP;
    let verificationOTPExpires;

    if (googleId) {
      // For Google sign-in, we don't need a password or OTP
      isVerified = true;
    } else {
      // For regular sign-up
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);

      // Generate OTP
      verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
      verificationOTPExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Send OTP via email
      await sendVerifyOTP(email, verificationOTP);
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      googleId,
      referralCode: uniqueReferralCode,
      isVerified,
      referredBy: referredByUser ? referredByUser._id : null,
      verificationOTP,
      verificationOTPExpires,
    });

    // Save new user
    await newUser.save();

    // Update referrer's credits if applicable
    if (referredByUser) {
      referredByUser.credits += 100;
      await referredByUser.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: googleId 
        ? 'User registered successfully with Google.' 
        : 'User registered successfully. Please check your email for the verification OTP.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during registration' });
  }
}