"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Todo } from "@prisma/client";
import { useDebounceValue } from "usehooks-ts";



function Dashboard() {

    const user = useUser();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);    


    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);




    const fetchTodos = useCallback(async (page: number  ) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/todos?page=${page}&search=${debouncedSearchTerm}`);

            if (!res.ok) {
                throw new Error("Failed to fetch todos");
            }

            const data = await res.json();
            setTodos(data.todos);
            setCurrentPage(data.currentPage)
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);

            setLoading(false);

        } catch (error) {
            console.error("Error fetching todos: ", error);
            setError("Failed to fetch todos");
            setLoading(false);
        }
    }, [debouncedSearchTerm, currentPage]);


    const handleAddTodo = async (title: string) => {
        try {
            if (!title.trim()) return;

            setLoading(true);

            const res = await fetch("/api/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title }),
            });

            if (!res.ok) {
                throw new Error("Failed to add todo");
            }

            await fetchTodos(currentPage);

            setLoading(false);

        } catch (error) {
            console.error("Error adding todo: ", error);
            setError("Failed to add todo");
        }
    };


    const handleUpdateTodo = async (id: number, completed: boolean) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/todos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ completed }),
            });

            if (!res.ok) {
                throw new Error("Failed to update todo");
            }

            await fetchTodos(currentPage);

            setLoading(false);
            setError("");

        } catch (error) {
            setError("Failed to update todo");
            setLoading(false);
        }
    }


    const handleDeleteTodo = async (id: number) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/todos/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete todo");
            }

            await fetchTodos(currentPage);

            setLoading(false);
            setError("");

        } catch (error) {
            setError("Failed to delete todo");
            setLoading(false);
        }
    }


    const fetchSubscriptionStatus = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/subscription");

            if (!res.ok) {
                throw new Error("Failed to fetch subscription status");
            }

            const data = await res.json();
            setSubscriptionStatus(data.isSubscribed);

            setLoading(false);

        } catch (error) {
            setError("Failed to fetch subscription status");
        }
    }


    useEffect(() => {
        fetchTodos(1);
        fetchSubscriptionStatus();
    }, [])
    


    return (
        <div>
            
        </div>
    )
}



export default Dashboard