import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";



export async function POST(req: Request) {
    try {
        
        const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!CLERK_WEBHOOK_SECRET) {
            throw new Error("Webhook secret is not defined");
        }

        const headerPayload = await headers()
        const svix_id = headerPayload.get("svix-id")
        const svix_timestamp = headerPayload.get("svix-timestamp")
        const svix_signature = headerPayload.get("svix-signature")

        if (!svix_id || !svix_timestamp || !svix_signature) {
            throw new Response("Missing svix headers", { status: 400});
        }
        

        const payload = await req.json();
        const body = JSON.stringify(payload);


        const wh = new Webhook(CLERK_WEBHOOK_SECRET);

        let evt: WebhookEvent;

        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;

        if (evt.type === "user.created") {
            
            const { email_addresses, primary_email_address_id} = evt.data;

            const primaryEmail = email_addresses.find(
                (email) => email.id === primary_email_address_id
            );
            

            if (!primaryEmail) {
                return new Response("Primary email not found", { status: 400 });
            }


            const newUser = await prisma.user.create({
                data: {
                    id: evt.data.id,
                    email: primaryEmail.email_address,
                    isSubscribed: false
                }
            })
            console.log("New user created:", newUser);
        }
            
        
    } catch (error) {
        console.error("Error creating user in database:", error);
        return new Response(`Error: ${error}`, { status: 500 });
    }

    return new Response("Webhook received successfully", { status: 200 });
}