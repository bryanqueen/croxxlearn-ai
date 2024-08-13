import dbConnect from '@/lib/mongodb';
import User from '@/model/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, email, password, institution, referralCode } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      let referredByUser;
      if (referralCode) {
        referredByUser = await User.findOne({ referralCode });
      }

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        institution,
      });

      if (referredByUser) {
        referredByUser.credits += 300;
        await referredByUser.save();
        newUser.referredBy = referralCode;
      }

      await newUser.save();

      res.status(201).json({ success: true, user: newUser });
    } catch (error) {
      res.status(400).json({ success: false, error });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
