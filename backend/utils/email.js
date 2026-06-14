const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || `ShopEase <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

// Email templates
exports.sendOTPEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: 'ShopEase - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">ShopEase</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hello, ${name}! 👋</h2>
          <p>Your OTP for email verification is:</p>
          <div style="background: #667eea; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © 2024 ShopEase. All rights reserved.
        </div>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: 'ShopEase - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">ShopEase</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hello, ${name}!</h2>
          <p>You requested a password reset. Your OTP is:</p>
          <div style="background: #f5576c; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please secure your account immediately.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © 2024 ShopEase. All rights reserved.
        </div>
      </div>
    `,
  });
};

exports.sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  await sendEmail({
    to: email,
    subject: `ShopEase - Order Confirmed #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">ShopEase</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Order Confirmed! 🎉</p>
        </div>
        <div style="padding: 30px;">
          <h2>Thank you, ${name}!</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align: right; font-size: 18px; font-weight: bold;">
            Total: ₹${order.billing.total.toFixed(2)}
          </div>
          <p style="margin-top: 20px;">Estimated Delivery: <strong>3-5 business days</strong></p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © 2024 ShopEase. All rights reserved.
        </div>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail: exports.sendOTPEmail, sendPasswordResetEmail: exports.sendPasswordResetEmail, sendOrderConfirmationEmail: exports.sendOrderConfirmationEmail };
