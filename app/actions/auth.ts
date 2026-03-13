"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export async function loginAction(prevState: any, formData: FormData) {
    await delay(1200)

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { error: "Email and password are required." }
    }

    if (password.length < 8) {
        return { error: "Invalid credentials." }
    }

    // Set mock JWT cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_token", "mock_jwt_token_" + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    redirect("/dashboard")
}

export async function signupAction(prevState: any, formData: FormData) {
    await delay(1200)

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const terms = formData.get("terms") as string

    if (!name || !email || !password || !confirmPassword) {
        return { error: "All fields are required." }
    }

    if (!terms) {
        return { error: "You must agree to the Terms of Service." }
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." }
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters long." }
    }

    // Set mock JWT cookie for successful signup
    const cookieStore = await cookies()
    cookieStore.set("auth_token", "mock_jwt_token_" + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    redirect("/dashboard")
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("auth_token")
    redirect("/auth/login")
}
