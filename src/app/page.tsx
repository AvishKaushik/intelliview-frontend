"use client";

import { useEffect, useState } from "react";
import {
  getIdToken,
  loginWithCognito,
  logout,
  handleAuthRedirect,
} from "@/lib/oidcClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    (async () => {
      await handleAuthRedirect();
      const token = getIdToken();
      setIsLogged(!!token);
      setChecking(false);
      if (token) router.replace("/app");
    })();
  }, [router]);
  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <p className="text-gray-500 animate-pulse">Checking session…</p>
      </div>
    );
  }
  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="text-gray-800 text-center space-y-6 bg-white px-10 py-12 rounded-xl shadow-xl max-w-md w-full"
      >
        <motion.h1 variants={fadeUp} className="text-4xl font-bold">
          🧠 IntelliView
        </motion.h1>
        <motion.p variants={fadeUp} className="text-lg">
          Your AI‑Powered Interview Companion
        </motion.p>

        {isLogged ? (
          <>
            <motion.button
              variants={fadeUp}
              onClick={() => router.replace("/app")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition"
            >
              Enter Dashboard →
            </motion.button>

            <motion.p variants={fadeUp} className="text-sm text-green-600 mt-4">
              ✅ You are logged in
            </motion.p>

            <motion.button
              variants={fadeUp}
              onClick={logout}
              className="text-sm text-red-500 underline hover:text-red-600"
            >
              Sign out
            </motion.button>
          </>
        ) : (
          <motion.button
            variants={fadeUp}
            onClick={loginWithCognito}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition"
          >
            Login with Cognito
          </motion.button>
        )}
      </motion.div>
    </main>
  );
}
