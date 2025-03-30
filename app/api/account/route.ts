import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import type { SessionData } from "@/lib/session";


export async function POST(request: NextRequest) {
  try {
    // Retrieve session from cookies
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    // Extract `account` from the request body
    const req: { account: string | undefined } = await request.json();
    const account = req.account;

    // Update session with the new user ID and save it
    session.account = account;
    await session.save();

    return NextResponse.json({ account });

  } catch (error) {
    console.error("Error handling user session switch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Retrieve session from cookies
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    return NextResponse.json({ account: session.account });

  } catch (error) {
    console.error("Error handling user session switch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
