"use client"
import { AuthContext } from "@/providers/AuthProvider";
import { AuthContextType } from "@/types";
import { useContext } from "react";

export default function Todo() {
    const auth = useContext(AuthContext) as AuthContextType;
    const { user } = auth;
    return <div>
        {user?.displayName}
    </div>;
}
