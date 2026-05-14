import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASSWORD as string,
  },
  tls: {
    rejectUnauthorized: false,
    // @ts-ignore
    family: 4
  },
  // @ts-ignore
  family: 4,
  debug: true,
  logger: true
} as any);

// Debug env variables
console.log("SMTP Config Check:");
console.log("- Host:", process.env.SMTP_HOST);
console.log("- Port:", process.env.SMTP_PORT);
console.log("- User:", process.env.SMTP_USER);
const p = process.env.SMTP_PASSWORD || "";
console.log("- Pass Length:", p.length);
if (p.length > 0) {
  console.log("- Pass Check:", p[0] + "***" + p[p.length-1]);
}

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Transporter verification failed:", error);
  } else {
    console.log("Server is ready to take our messages");
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
