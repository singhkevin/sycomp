import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: true,
  maxConnections: 1,
  maxMessages: 100,
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOTP = async (email: string, otp: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sycomp" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Sycomp Login Code",
      text: `Your One-Time Password (OTP) for Sycomp is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sycomp Login Code</h2>
          <p>Your One-Time Password (OTP) to securely log in is:</p>
          <h1 style="background: #f4f4f5; padding: 10px; border-radius: 5px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
        </div>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error.message || error);
    return { success: false, error: error.message || "Failed to send email" };
  }
};
