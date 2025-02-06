const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendPasswordResetEmail(email, token) {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    console.log("Email configuration:", {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER,
      frontendUrl: process.env.FRONTEND_URL,
      recipientEmail: email,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetLink}">link</a> to reset your password.</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

async function sendWelcomeEmail(email, name) {
  try {
    const siteUrl = process.env.FRONTEND_URL;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Sheet Music Library!",
      html: `
        <h2>Welcome to Sheet Music Library, ${name}!</h2>
        <p>Thank you for joining our community. We're excited to have you on board!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our collection of sheet music</li>
          <li>Create and manage your own library</li>
          <li>Share and collaborate with other musicians</li>
        </ul>
        <p>Visit our site at: <a href="${siteUrl}">${siteUrl}</a></p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <br>
        <p>Best regards,</p>
        <p>The Sheet Music Library Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

async function sendContactEmail(senderEmail, senderName, message) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "librarysheetmusic@gmail.com",
      subject: `New Contact Form Message from ${senderName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      replyTo: senderEmail,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Contact email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactEmail,
};
