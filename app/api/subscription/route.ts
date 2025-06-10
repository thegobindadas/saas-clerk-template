import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";



export async function POST() {
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        // create payment intent


        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)


        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isSubscribed: true,
                subscriptionEnds: subscriptionEnds
            }
        })

        if (!updatedUser) {
            return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
        } 

        

        return NextResponse.json(
            { 
                updatedUser,
                message: "Subscription successful." 
            }, 
            { status: 200 }
        );
            
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}


export async function GET() {
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                isSubscribed: true,
                subscriptionEnds: true
            }
        })


        const now = new Date();

        if (user?.subscriptionEnds && user.subscriptionEnds < now) {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    isSubscribed: false,
                    subscriptionEnds: null
                }
            })

            return NextResponse.json(
                { 
                    isSubscribed: false, 
                    subscriptionEnds: null,
                    message: "Subscription has expired."
                }, 
                { status: 200 }
            );
        }



        return NextResponse.json(
            { 
                isSubscribed: user?.isSubscribed,
                subscriptionEnds: user?.subscriptionEnds,
                message: `Subscription ends on ${user?.subscriptionEnds}`
            }, 
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}