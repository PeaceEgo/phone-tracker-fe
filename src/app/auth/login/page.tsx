"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, ArrowRight, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { LoginFormData, loginSchema } from "@/lib/validation";
import { useEffect } from "react";

const Login = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError, needsVerification, verificationEmail } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if user needs verification
  useEffect(() => {
    if (needsVerification && verificationEmail) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(verificationEmail)}`);
    }
  }, [needsVerification, verificationEmail, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (error) {
      
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />

      {/* Floating animation elements */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md p-6">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-6" 
            whileHover={{ scale: 1.05 }}
          >
            <Smartphone className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              TrackGuard
            </span>
          </motion.div>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-gray-400">Enter your credentials to access your account.</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-400 text-center mb-4">{error}</div>
              )}

              {/* Login form */}
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                        errors.email ? "border-red-500" : "border-white/20"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-all duration-300 hover:border-white/30`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                        errors.password ? "border-red-500" : "border-white/20"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-all duration-300 hover:border-white/30`}
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-semibold group"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </form>

              {/* Footer links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-4 mt-6"
              >
                <div className="text-center text-sm text-gray-400">
                  <p>
                    Don't have an account yet?{" "}
                    <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                      Sign Up
                    </Link>
                  </p>
                </div>

                <div className="text-center text-sm">
                  <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;