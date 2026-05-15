"use server";

import { prisma } from "@/lib/prisma";
import { sendOTP } from "@/lib/email";
import { createSession } from "@/lib/session";

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOTP(email: string, role: "USER" | "ADMIN") {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Only update OTP fields — NEVER overwrite the existing role
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiresAt: expiresAt,
        },
      });
    } else {
      // New user — create with the role from the login form
      await prisma.user.create({
        data: {
          email,
          role,
          otpCode: otp,
          otpExpiresAt: expiresAt,
        },
      });
    }

    // Send email
    await sendOTP(email, otp);
    
    // In test environment, also log it
    console.log(`[TEST OTP] Role: ${existingUser?.role ?? role} | Email: ${email} | OTP: ${otp}`);

    return { success: true };
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return { success: false, error: "Failed to process request" };
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.otpCode !== otp) {
      return { success: false, error: "Invalid OTP" };
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return { success: false, error: "OTP has expired" };
    }

    // Clear OTP and create session
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    await createSession(user.id, user.role);
    
    return { success: true, role: user.role };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}

export async function logout() {
  const { deleteSession } = await import("@/lib/session");
  await deleteSession();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}
