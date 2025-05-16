import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        );
    }
}