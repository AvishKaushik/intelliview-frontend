"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/user";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";

interface SessionRec {
  sessionId: string;
  category: string;
  difficulty: string;
  ts: number;
}

function formatDate(ts: number) {
  const date = new Date(ts * 1000);
  return {
    absolute: date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    relative:
      date.toDateString() === new Date().toDateString()
        ? `Today at ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
  };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const endpoint = process.env.NEXT_PUBLIC_LIST_SESSIONS_ENDPOINT!;
        const res = await fetch(`${endpoint}?userId=${await getUserId()}`);
        if (!res.ok) throw new Error(await res.text());

        const raw: SessionRec[] = await res.json();
        const latestSessions = new Map<string, SessionRec>();
        raw.forEach((r) => {
          if (
            !latestSessions.has(r.sessionId) ||
            r.ts > latestSessions.get(r.sessionId)!.ts
          ) {
            latestSessions.set(r.sessionId, r);
          }
        });
        const sorted = Array.from(latestSessions.values()).sort(
          (a, b) => b.ts - a.ts
        );
        setSessions(sorted);
      } catch (e: unknown) {
        setError((e as Error).message || "Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  if (loading) {
    return (
      <main className="p-6 text-center from-gray-100 to-gray-200 min-h-screen">
        Loading your sessions…
      </main>
    );
  }

  if (error) {
    return <main className="p-6 text-center text-red-500">⚠️ {error}</main>;
  }

  return (
    <main className="p-10 from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-3xl mx-auto p-6 space-y-6 bg-gradient-to-br from-gray-100 to-white rounded-lg shadow-md">
        <motion.h1
          className="text-3xl font-bold text-center text-neutral-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          🗂️ Past Interview Sessions
        </motion.h1>

        {sessions.length === 0 ? (
          <motion.div
            className="text-center text-gray-500 space-y-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-5xl">😶</p>
            <p className="text-lg font-medium">No interview sessions found.</p>
            <p className="text-sm text-gray-400">
              Start a new one from the dashboard to begin tracking!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess, idx) => {
              const { absolute, relative } = formatDate(sess.ts);
              return (
                <motion.div
                  key={sess.sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-5 border-l-4 border-gray-800 bg-white hover:shadow-xl transition-all flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-gray-900">
                        {sess.category} —{" "}
                        <span className="capitalize">{sess.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarClock className="w-4 h-4" />
                        <span title={absolute}>{relative}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <Button
                        className="w-full sm:w-auto bg-gray-800 text-white hover:bg-gray-700"
                        onClick={() =>
                          (window.location.href = `/review?sessionId=${sess.sessionId}`)
                        }
                      >
                        📄 Review
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
