"use client";

import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";



function Signup() {

    const { isLoaded, setActive, signUp } = useSignUp();
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();


    if (!isLoaded) {
        return null;
    }


    const handleSignUp = async (e: React.FormEvent) => {

        e.preventDefault();

        try {

            if (!isLoaded) {
                return;
            }

            
            const signUP = await signUp?.create({
                emailAddress,
                password
            })
            console.log("Clerk SignUp: ", signUP)


            const sendOtp = await signUP.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            console.log("Clerk Send Otp: ", sendOtp)    


            setPendingVerification(true);

        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors[0].message);
        }
    }


    const handleGoogleSignup = async (e: React.FormEvent) => {
        
        e.preventDefault();

        try {

            if (!isLoaded) {
                return;
            }

            
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors[0].message);
        }
    }


    const onPressVerify = async (e: React.FormEvent) => {

        e.preventDefault();
        
        try {
            
            if (!isLoaded) {
                return;
            }

            if (!verificationCode?.trim()) {
                setError("Verification code is required");
                return;
            }


            const verification = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            })
            console.log("Clerk Verification: ", verification)

            if (verification.status !== "complete") {
                console.log(JSON.stringify(verification, null, 2));
            }

            if (verification.status === "complete") {
                const userActive = await setActive({ session: verification.createdSessionId });
                console.log("Clerk User Active: ", userActive)
                router.push("/dashboard");
            }

        } catch (err: any) { 
            console.error(JSON.stringify(err, null, 2));
            setError(err.errors[0].message);
        }
    }

    const handleResendCode = async () => {

    }



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {error && (
                    <Alert variant="destructive" className={`${error ? 'border-red-500 bg-red-900/20 text-red-400' : 'border-green-500 bg-green-900/20 text-green-400'}`}>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm shadow-2xl">
                    {!pendingVerification ? (
                        <>
                            <CardHeader className="space-y-1 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <CardTitle className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                                    Create Account
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-base">
                                    Join us today and start your journey
                                </CardDescription>
                            </CardHeader>
                        
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-300 font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={emailAddress}
                                                onChange={(e) => setEmailAddress(e.target.value)}
                                                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-gray-300 font-medium">
                                                Password
                                            </Label>
                                            <Link href={"/forgot-password"}
                                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 pr-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                
                                    <Button
                                        onClick={handleSignUp}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        Create Account
                                    </Button>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                                    </div>
                                </div>
                                
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogleSignup}
                                    className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 h-12 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Sign up with Google
                                </Button>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader className="space-y-1 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
                                        <Shield className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <CardTitle className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">
                                    Verify Your Email
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-base">
                                    We've sent a 6-digit code to {emailAddress}
                                </CardDescription>
                            </CardHeader>
                        
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 font-medium text-center block">
                                            Enter Verification Code
                                        </Label>
                                        <div className="flex justify-center">
                                            <InputOTP
                                                maxLength={6}
                                                value={verificationCode}
                                                onChange={(value) => setVerificationCode(value)}
                                                className="gap-2"
                                            >
                                                <InputOTPGroup className="gap-2">
                                                <InputOTPSlot 
                                                    index={0} 
                                                    className="w-12 h-12 text-xl font-bold bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <InputOTPSlot 
                                                    index={1} 
                                                    className="w-12 h-12 text-xl font-bold bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <InputOTPSlot 
                                                    index={2} 
                                                    className="w-12 h-12 text-xl font-bold bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <InputOTPSlot 
                                                    index={3} 
                                                    className="w-12 h-12 text-xl font-bold bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <InputOTPSlot 
                                                    index={4} 
                                                    className="w-12 h-12 text-xl font-bold bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                <InputOTPSlot 
                                                    index={5} 
                                                    className="w-12 h-12 text-xl font-bold bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                                                />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </div>
                                
                                    <Button
                                        onClick={onPressVerify}
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold h-12 transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        Verify Email
                                    </Button>
                                
                                    <div className="text-center space-y-2">
                                        <p className="text-gray-400 text-sm">
                                            Didn't receive the code?
                                        </p>
                                        <button
                                            onClick={handleResendCode}
                                            className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors hover:underline"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                
                                    <Link href={"/sign-up"}
                                        className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 h-12 transition-all duration-200"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Sign Up
                                    </Link>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
                
                <div className="text-center">
                    <p className="text-gray-400">
                        {!pendingVerification ? (
                            <>
                                Already have an account?{' '}
                                <Link href={'/sign-in'} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline">
                                    Sign in here
                                </Link>
                            </>
                            ) : (
                            <>
                                Need help?{' '}
                                <Link href={'/'} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline">
                                    Contact support
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}



export default Signup