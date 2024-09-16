import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  institution: {type: String, required: true},
  credits: {type: Number, default: 1000},
  referralCode: {type: String, unique: true},
  referredBy: {type: String},
  resetPasswordOTP: {type: String},
  resetPasswordOTPExpires: {type: Date}
});

function generateUniqueCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}


UserSchema.pre('save', function (next) {
  if(!this.referralCode){
    this.referralCode = generateUniqueCode();
  }
  // this.referralLink = `${process.env.APP_URL}/register?referralCode=${this.referralCode}`;
  next()
})

export default mongoose.models.User || mongoose.model('User', UserSchema);
