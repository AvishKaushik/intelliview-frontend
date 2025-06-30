"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { v4 as uuid } from "uuid";
import { getUserId } from "@/lib/user";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}
const categories = ["Behavioral", "DSA", "System Design", "HR", "Product"];
const difficulties = ["Easy", "Medium", "Hard"];
const lambdaEndpoint = process.env.NEXT_PUBLIC_LAMBDA_INTERVIEW_ENDPOINT!;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

async function callLambda(
  sessionId: string,
  ts: number,
  messages: Msg[],
  category: string,
  difficulty: string
) {
  const userId = getUserId();
  const res = await fetch(lambdaEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      ts,
      userId,
      category,
      difficulty,
      messages,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ message: string }>;
}

export default function InterviewPage() {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [started, setStarted] = useState(false);
  const [enableFeedback, setEnableFeedback] = useState(true);
  const [ended, setEnded] = useState(false);
  const [sessionId] = useState(() => uuid());
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [ts, setTs] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(
    () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages, loading]
  );

  const systemPrompt = () =>
    `You are an expert interviewer conducting a ${difficulty.toLowerCase()}‑level ${category} interview. Ask only one question at a time, never give hints or answers.`;

  async function startInterview() {
    setStarted(true);
    setEnded(false);
    setTs(Math.floor(Date.now() / 1000));
    const firstUser: Msg = { role: "user", content: systemPrompt() };
    try {
      const data = await callLambda(
        sessionId,
        ts,
        [firstUser],
        category,
        difficulty
      );
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (e) {
      setMessages([
        { role: "assistant", content: "⚠️ Failed to start interview." },
      ]);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const uiHistory = [...messages, userMsg];
    setMessages(uiHistory);
    setInput("");
    setLoading(true);

    try {
      const data = await callLambda(
        sessionId,
        ts,
        [{ role: "user", content: systemPrompt() }, ...uiHistory],
        category,
        difficulty
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      setEnded(true);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error during interview." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-4xl space-y-6"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        <motion.h1
          className="text-3xl font-bold text-center text-gray-800"
          variants={fadeUp}
        >
          🧠 IntelliView Interview
        </motion.h1>
        {!started && (
          <motion.div className="flex flex-col" variants={fadeUp}>
            <Card className="p-6 space-y-5">
              <h2 className="text-xl font-semibold">
                🎯 Configure Your Interview
              </h2>

              <div>
                <Label className="text-sm">Category</Label>
                <Select onValueChange={setCategory}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Difficulty</Label>
                <Select onValueChange={setDifficulty}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choose difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={enableFeedback}
                  onCheckedChange={setEnableFeedback}
                />
                <Label>Enable feedback</Label>
              </div>

              <Button
                className="w-full"
                disabled={!category || !difficulty}
                onClick={startInterview}
              >
                🚀 Start Interview
              </Button>
            </Card>
          </motion.div>
        )}
        {started && (
          <motion.div variants={fadeUp} className="space-y-4 flex flex-col">
            <div className="bg-white p-4 rounded-lg border max-h-[70vh] overflow-y-auto space-y-2 flex flex-col">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-md text-sm whitespace-pre-wrap max-w-[80%] ${
                    m.role === "assistant"
                      ? "bg-gray-100 text-gray-800 self-start"
                      : "bg-gray-800 text-white self-end"
                  }`}
                >
                  {m.content}
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Typing…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex flex-col gap-2">
              <Textarea
                rows={3}
                value={input}
                placeholder="Type your answer…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>

            {ended && !loading && (
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-3 justify-between items-center pt-2 border-t mt-4"
              >
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (enableFeedback) {
                      try {
                        await fetch(
                          `${process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT}/feedback`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ sessionId, ts, messages }),
                          }
                        );
                      } catch (err) {
                        console.error("Feedback failed", err);
                      }
                    }
                    window.location.href = `/review?sessionId=${sessionId}`;
                  }}
                >
                  📄 Review This Session
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
