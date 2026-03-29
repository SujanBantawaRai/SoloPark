const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"SoloPark System" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.to}`);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Email status could not be sent.');
    }
};

module.exports = sendEmail;
