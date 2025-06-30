"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ReviewPage() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId");
  const [feedback, setFeedback] = useState<any | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing sessionId in URL");
      setLoading(false);
      return;
    }

    const endpoint =
      `${process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT}/review`;
    if (!endpoint) {
      setError("NEXT_PUBLIC_REVIEW_LAMBDA_ENDPOINT env var not set");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${endpoint}?sessionId=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        let msgs: Msg[] = [];
        if (Array.isArray(data.messages)) {
          if (data.messages.length && data.messages[0].messages) {
            const latest = data.messages[data.messages.length - 1];
            msgs = latest.messages as Msg[];
            const feedback = latest.feedback || null;
            setMessages(msgs);
            setFeedback(feedback);
          } else {
            msgs = data.messages as Msg[];
          }
        }
        setMessages(msgs);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading…</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );

  return (
    <main className="w-full max-w-6xl mx-auto px-6 py-10 space-y-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <motion.h1
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="text-4xl font-bold text-center text-gray-800"
      >
        📄 Interview Review
      </motion.h1>

      <motion.div
        className="flex flex-col gap-4 bg-white rounded-xl shadow-lg p-8 space-y-8"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-md text-sm whitespace-pre-wrap w-fit max-w-3xl ${
              m.role === "assistant"
                ? "bg-gray-200 text-black self-start"
                : "bg-indigo-600 text-white self-end"
            }`}
          >
            {m.content}
          </div>
        ))}
      </motion.div>

      {feedback && (
        <motion.div
          className="space-y-6 bg-white rounded-xl p-8 shadow-lg"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <h2 className="text-2xl font-semibold text-gray-800">💬 Claude Feedback</h2>
          <p className="text-gray-600">{feedback.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(feedback.ratings || {}).map(([key, val]) => (
              <div
                key={key}
                className="bg-indigo-50 p-4 rounded-lg border border-indigo-100"
              >
                <p className="text-sm text-gray-500">{key}</p>
                <p className="text-lg font-semibold text-indigo-700">{val} / 10</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold text-green-700 text-lg">✅ Strengths</h3>
            <ul className="list-disc ml-6 text-green-700">
              {feedback.strengths?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-red-700 text-lg">⚠️ Weaknesses</h3>
            <ul className="list-disc ml-6 text-red-700">
              {feedback.weaknesses?.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-indigo-700 text-lg">🧠 Suggestions</h3>
            <ul className="list-disc ml-6 text-indigo-700">
              {feedback.suggestions?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </main>
  );
}
