import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function isAdmin(userId: string) {
    const clerkClientInstance = await clerkClient();
    const user = await clerkClientInstance.users.getUser(userId);
    return user?.publicMetadata.role === "admin";
}