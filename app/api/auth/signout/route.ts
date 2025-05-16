import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth"; // your NextAuth config
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json({ message: "Logged out successfully" });

        // Clear the session cookie
        response.cookies.set("next-auth.session-token", "", {
            path: "/",
            expires: new Date(0), // set expiry in the past
        });

        response.cookies.set("next-auth.csrf-token", "", {
            path: "/",
            expires: new Date(0),
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}
