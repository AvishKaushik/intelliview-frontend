"use client";

import { useEffect, useState } from "react";
import { getIdToken, logout, handleAuthRedirect } from "@/lib/oidcClient";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fetchSkills } from "@/lib/skills";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type JwtPayload = {
  email?: string;
  name?: string;
  exp?: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const router = useRouter();
  const [skills, setSkills] = useState<Awaited<
    ReturnType<typeof fetchSkills>
  > | null>(null);
  const [skillErr, setSkillErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchSkills()
      .then(setSkills)
      .catch((e) => setSkillErr(e.message));
  }, [user]);

  useEffect(() => {
    handleAuthRedirect();
    const token = getIdToken();
    if (!token) {
      router.push("/");
    } else {
      const decoded = jwtDecode<JwtPayload>(token);
      setUser(decoded);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="max-w-2xl w-full space-y-6"
      >
        <motion.h1
          className="text-3xl font-bold text-center text-gray-800"
          variants={fadeUp}
        >
          Welcome, {user.name || user.email}
        </motion.h1>

        <div className="grid sm:grid-cols-2 gap-6">
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => router.push("/interview")}
          >
            <Card className="p-6 h-full hover:shadow-md transition-all">
              <h2 className="text-xl font-semibold text-gray-800">
                🧠 Start Interview
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Begin a new AI-powered interview.
              </p>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => router.push("/sessions")}
          >
            <Card className="p-6 h-full hover:shadow-md transition-all">
              <h2 className="text-xl font-semibold text-gray-800">
                📂 Past Sessions
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Review your previous interview sessions.
              </p>
            </Card>
          </motion.div>
        </div>
        <motion.div variants={fadeUp}>
          <Card className="p-6 hover:shadow-md transition-all space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              📊 Review Skills
            </h2>

            {!skills && !skillErr && (
              <p className="text-gray-500 text-sm">Loading…</p>
            )}
            {skillErr && <p className="text-red-600 text-sm">⚠️ {skillErr}</p>}

            {skills && (
              <>
                <p className="text-sm text-gray-600">
                  Sessions analysed: <b>{skills.sessionsAnalyzed}</b>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(skills.avgRatings).map(([k, v]) => (
                    <div
                      key={k}
                      className="bg-indigo-50 p-3 rounded-lg text-center"
                    >
                      <p className="text-xs text-gray-500 capitalize">{k}</p>
                      <p className="text-lg font-semibold text-indigo-700">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-left">
                  <p className="font-medium text-green-700 mb-1">
                    Top strengths
                  </p>
                  <ul className="list-disc ml-5 text-sm">
                    {skills.topStrengths.map(([s]) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="font-medium text-red-700 mt-3 mb-1">
                    Top weaknesses
                  </p>
                  <ul className="list-disc ml-5 text-sm">
                    {skills.topWeaknesses.map(([w]) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center mt-6">
          <Button onClick={logout} variant="ghost" className="text-red-500">
            🔓 Sign Out
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
