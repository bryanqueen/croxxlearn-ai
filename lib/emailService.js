import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path';
const transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
    },
    });


    
export const sendOTP = async (email, otp) => {
    
    // Read the HTML template
    const templatePath = path.join(process.cwd(), 'lib', 'password-reset.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace the placeholder with the actual OTP and firstname
    html = html.replace('{{OTP}}', otp);


    console.log(`Sending OTP: ${otp} to ${email}`)

    //Send mail
    await transporter.sendMail({
        from: 'croxxlearn ai reset@croxxlearn.com',
        to: email,
        subject: 'Password Reset OTP',
        html
        
    });
    
}