import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


const ITEMS_PER_PAGE = 10;



export async function POST(request: NextRequest) {
    try {

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                todos: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        if (!user.isSubscribed && user.todos.length >= 3) {
            return NextResponse.json({ error: "Free users can only create up to 3 todos. Please subscribe for more." }, { status: 403 });
            
        }


        const { title } = await request.json()

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }


        const newTodo = await prisma.todo.create({
            data: {
                title,
                userId
            }
        })

        if (!newTodo) {
            return NextResponse.json({ error: "Failed to create todo. Please try again later." }, { status: 500 });
        } 
        
        

        return NextResponse.json(
            {
                newTodo,
                message: "Todo created successfully" ,
                success: true
            }, 
            { status: 200 }
        );
            
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";


        const todos = await prisma.todo.findMany({
            where: {
                userId,
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            take: ITEMS_PER_PAGE,
            skip: (page - 1) * ITEMS_PER_PAGE,
            orderBy: {
                createdAt: "desc"
            }
        })

        if (!todos) {
            return NextResponse.json({ error: "No todos found" }, { status: 404 });
        }


        const totalItems = await prisma.todo.count({
            where: {
                userId,
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            },
        })

        if (!totalItems) {
            return NextResponse.json({ error: "No todos found" }, { status: 404 });
        }


        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);



        return NextResponse.json(
            {
                todos,
                currentPage: page,
                totalPages,
                totalItems,
                message: "Todos fetched successfully" ,
                success: true
            }, 
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}