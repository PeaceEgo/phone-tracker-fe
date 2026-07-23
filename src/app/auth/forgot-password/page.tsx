"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, ArrowRight, Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { forgotPassword, resetPassword } from "@/lib/api";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/validation";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRequestCode = async (data: ForgotPasswordFormData) => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      const res = await forgotPassword(data.email);
      setEmail(data.email);
      resetForm.setValue("email", data.email);
      setInfo(res.message);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword({
        email: data.email,
        otp: data.otp.trim(),
        password: data.password,
      });
      setStep("done");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!email) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setInfo(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />

      <div className="relative z-10 w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-6">
            <Smartphone className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              TrackGuard
            </span>
          </Link>
        </motion.div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-8">
            {step === "email" && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-white">Reset password</h2>
                  <p className="text-gray-400 text-sm">
                    Enter your email and we&apos;ll send a reset code if an account exists.
                  </p>
                </div>

                <form onSubmit={emailForm.handleSubmit(onRequestCode)} className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      {...emailForm.register("email")}
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "Sending..." : "Send reset code"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </>
            )}

            {step === "reset" && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-white">Enter reset code</h2>
                  <p className="text-gray-400 text-sm">
                    Code sent to <span className="text-white">{email}</span>. Expires in 15 minutes.
                  </p>
                </div>

                {info && <p className="text-blue-300 text-sm mb-4">{info}</p>}

                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <input type="hidden" {...resetForm.register("email")} />

                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Reset code (OTP)"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                      {...resetForm.register("otp")}
                    />
                    {resetForm.formState.errors.otp && (
                      <p className="text-red-400 text-sm mt-1">
                        {resetForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>

                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    {...resetForm.register("password")}
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-red-400 text-sm">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    {...resetForm.register("confirmPassword")}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-sm">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "Resetting..." : "Reset password"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => void resendCode()}
                    disabled={isSubmitting}
                    className="w-full text-sm text-blue-400 hover:text-blue-300"
                  >
                    Resend code
                  </button>
                </form>
              </>
            )}

            {step === "done" && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">Password updated</h2>
                <p className="text-gray-400 text-sm">
                  Your sessions were cleared. Redirecting to login…
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/auth/login">Sign in now</Link>
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
