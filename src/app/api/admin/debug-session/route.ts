import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { POStatus } from "@prisma/client";

export async function POST(request: Request) {
  const { poId, status } = await request.json();
  
  const session = await verifySession();
  const sessionInfo = session ? {
    userId: session.userId,
    role: session.role,
    isAuth: session.isAuth,
  } : null;

  let dbUser = null;
  if (session?.userId) {
    dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, role: true },
    });
  }

  let updateResult = null;
  if (poId && status && dbUser?.role === "ADMIN") {
    try {
      updateResult = await prisma.purchaseOrder.update({
        where: { id: poId },
        data: { status: status as POStatus },
      });
    } catch (e) {
      updateResult = { error: String(e) };
    }
  }

  return NextResponse.json({
    sessionInfo,
    dbUser,
    updateAttempted: !!(poId && status),
    updateResult,
  });
}

export async function GET() {
  const session = await verifySession();
  const sessionInfo = session ? {
    userId: session.userId,
    role: session.role,
    isAuth: session.isAuth,
  } : null;

  let dbUser = null;
  if (session?.userId) {
    dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, role: true },
    });
  }

  const allPOs = await prisma.purchaseOrder.findMany({
    select: { id: true, poNumber: true, status: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sessionInfo, dbUser, allPOs });
}
