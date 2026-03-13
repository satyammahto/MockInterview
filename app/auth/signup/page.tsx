"use client"

import { useState } from "react"
import Link from "next/link"
import { useActionState } from "react"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthCard } from "@/components/auth/AuthCard"
import { InputField } from "@/components/auth/InputField"
import { PrimaryButton } from "@/components/auth/PrimaryButton"
import { signupAction } from "@/app/actions/auth"
import { Check } from "lucide-react"

export default function SignupPage() {
    const [state, action, isPending] = useActionState(signupAction, undefined)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [terms, setTerms] = useState(false)

    return (
        <AuthLayout>
            <AuthCard 
                title="Create your account" 
                description="Join PrepSense to start your AI-powered interview prep journey."
            >
                {state?.error && (
                    <div className="mb-6 rounded-xl px-4 py-3 text-sm text-destructive font-medium" style={{ background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)' }}>
                        {state.error}
                    </div>
                )}
                
                <form action={action} className="space-y-5">
                    <InputField 
                        label="Full Name" 
                        type="text" 
                        name="name" 
                        placeholder="Ricky Patel"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <InputField 
                        label="Email Address" 
                        type="email" 
                        name="email" 
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField 
                            label="Password" 
                            type="password" 
                            name="password" 
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <InputField 
                            label="Confirm Password" 
                            type="password" 
                            name="confirmPassword" 
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            // Error visualization if they don't match (optional client side check)
                            error={(confirmPassword && password !== confirmPassword) ? "Passwords don't match" : undefined}
                        />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1 pb-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input 
                                    type="checkbox" 
                                    name="terms" 
                                    required 
                                    className="peer sr-only"
                                    checked={terms}
                                    value="on"
                                    onChange={(e) => setTerms(e.target.checked)}
                                />
                                <div className="w-5 h-5 rounded-[6px] border-2 border-border/80 bg-surface peer-checked:bg-accent peer-checked:border-accent transition-all duration-200 group-hover:border-accent/50 group-hover:bg-accent/10 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/20"></div>
                                <Check className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity duration-200 scale-50 peer-checked:scale-100" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-muted-foreground leading-snug">
                                I agree to the <Link href="#" className="font-semibold text-foreground hover:text-accent transition-colors">Terms of Service</Link> and <Link href="#" className="font-semibold text-foreground hover:text-accent transition-colors">Privacy Policy</Link>.
                            </span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <PrimaryButton type="submit" loading={isPending}>
                            Create Account
                        </PrimaryButton>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-white font-bold hover:text-accent transition-colors">
                        Log in
                    </Link>
                </div>
            </AuthCard>
        </AuthLayout>
    )
}
