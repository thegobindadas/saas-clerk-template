import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";



export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { completed } = await req.json();
        const todoId = params.id;

        if (!todoId) {
            return NextResponse.json({ error: "Missing todo id" }, { status: 400 });
        }


        const todo = await prisma.todo.findUnique({
            where: { id: todoId },
        })

        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }


        if (todo.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 401 });
        }


        const updatedTodo = await prisma.todo.update({
            where: { id: todoId },
            data: { completed: completed },
        })

        if (!updatedTodo) {
            return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
        }

        

        return NextResponse.json(
            { 
                todo: updatedTodo,
                msg: "Todo updated successfully" 
            }, 
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json({ error }, { status: 401 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Missing todo id" }, { status: 400 });
        }


        const todo = await prisma.todo.findUnique({
            where: { id: id },
        })

        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }


        if (todo.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 401 });
        }


        const delTodo = await prisma.todo.delete({
            where: { id: id },
        })

        if (!delTodo) {
            return NextResponse.json({ error: "Todo deletion failed" }, { status: 404 });
        }



        return NextResponse.json({ message: "Todo deleted successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error }, { status: 401 });
    }
}