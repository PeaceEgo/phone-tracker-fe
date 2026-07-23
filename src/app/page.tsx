"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Smartphone,
  MapPin,
  Radio,
  History,
  ArrowRight,
  Check,
} from "lucide-react";
import Header from "@/components/header";

interface Position {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isClient, setIsClient] = useState(false);

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  useEffect(() => {
    setIsClient(true);
    const newPositions = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setPositions(newPositions);
  }, []);

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Live location",
      description:
        "Follow registered devices on a map with GPS updates over WebSockets.",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Device registration",
      description:
        "Register devices to your account and manage them from one dashboard.",
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Location history",
      description:
        "Review past location points for each device when you need context.",
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: "Realtime tracking",
      description:
        "Start tracking sessions and see position updates as they arrive.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header variant="landing" showNavLinks={true} />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"
          style={{ y, opacity }}
        />

        {isClient && (
          <div className="absolute inset-0">
            {positions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                style={{
                  left: pos.left,
                  top: pos.top,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: pos.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: pos.delay,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Shield className="w-3.5 h-3.5 mr-1.5 inline" />
              Device location tracker
            </Badge>

            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              TrackGuard
              <br />
              <span className="text-blue-400">Know where devices are</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Register phones, view location history, and follow live GPS
              updates — built with Next.js, Socket.IO, and cookie-based auth.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg group cursor-pointer"
                onClick={handleSignUp}
              >
                Create account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-blue-100 px-8 py-4 text-lg group bg-white/5 cursor-pointer transition-all duration-300"
                onClick={handleLogin}
              >
                Sign in
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              What it does
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Focused location tracking — no fake parental-control claims.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to try it?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Create an account, register a device, and open the live map.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg group"
                onClick={handleSignUp}
              >
                Create account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex items-center text-sm text-gray-400">
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Free to explore with your own backend
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Smartphone className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-bold">TrackGuard</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} TrackGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
