'use client'
import { create } from 'zustand'
import jwt from 'jsonwebtoken'
export interface IUser {
    id: string;
    email: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

type AppProvider = {
    user: IUser | undefined,
    setUser: (user: IUser | undefined) => void
}
const isClient = typeof window !== 'undefined'
export const useAppStore = create<AppProvider>((set) => ({
    user: undefined as IUser | undefined,
    setUser(user) {
        set({ user })
    },

}))
const decodeToken = (token: string) => {
    return jwt.decode(token) as IUser
}
import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation';

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const path = usePathname()
    let token = isClient ? localStorage.getItem('token') : undefined

    useEffect(() => {
        if (!token) return
        const user = decodeToken(token)
        useAppStore.getState().setUser(user)
        console.log(useAppStore.getState().user)
    }, [path, token])


    return (
        <>
            {children}
        </>
    )
}
