"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const supabase = createClient();

const moods = [
  { icon: Smile, label: "Happy", value: "happy" },
  { icon: Meh, label: "Neutral", value: "neutral" },
  { icon: Frown, label: "Sad", value: "sad" },
];

const timeRanges = [
  { label: "Week", value: "7" },
  { label: "Month", value: "30" },
  { label: "Year", value: "365" },
];

const moodToNumber = {
  happy: 3,
  neutral: 2,
  sad: 1,
};

const moodMessages = {
  happy: [
    "Fantastic! Keep spreading that positivity!",
    "That's wonderful! Your happiness brightens the world!",
    "Amazing! Keep embracing those good vibes!",
    "Brilliant! Your joy is contagious!",
    "Excellent! Keep riding that wave of happiness!",
  ],
  neutral: [
    "Remember, tomorrow brings new opportunities!",
    "Take a moment to appreciate the little things.",
    "You're doing better than you think!",
    "Every day is a chance for something amazing.",
    "Keep moving forward, good things are coming!",
  ],
  sad: [
    "It's okay not to be okay. Tomorrow is a new day.",
    "You're stronger than you know. This too shall pass.",
    "Remember to be gentle with yourself.",
    "You're not alone. Better days are ahead.",
    "Take care of yourself today. You matter.",
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value;
    const moodLabel = ["Sad", "Neutral", "Happy"][moodValue - 1];
    return (
      <div className="bg-background border rounded-lg p-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{moodLabel}</p>
      </div>
    );
  }
  return null;
};

export default function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("7");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMoodData();
    }
  }, [userId, timeRange]);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
  };

  const fetchMoodData = async () => {
    const { data, error } = await supabase
      .from("mood_logger")
      .select("*")
      .eq("user_id", userId)
      .gte(
        "created_at",
        new Date(
          Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000
        ).toISOString()
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching mood data:", error);
      return;
    }

    const formattedData = data.map((entry) => ({
      date: new Date(entry.created_at).toLocaleDateString(),
      mood: moodToNumber[entry.mood as keyof typeof moodToNumber],
    }));

    setMoodData(formattedData);
  };

  const logMood = async () => {
    if (!selectedMood || !userId) return;

    const { error } = await supabase.from("mood_logger").insert([
      {
        mood: selectedMood,
        user_id: userId,
      },
    ]);

    if (error) {
      console.error("Error logging mood:", error);
      return;
    }

    const messages = moodMessages[selectedMood as keyof typeof moodMessages];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setConfirmationMessage(randomMessage);
    setShowConfirmation(true);

    fetchMoodData();
    setSelectedMood(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mood Logger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedMood}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="How are you feeling?" />
            </SelectTrigger>
            <SelectContent>
              {moods.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>
                  <div className="flex items-center">
                    <mood.icon className="mr-2 h-4 w-4" />
                    {mood.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full" disabled={!selectedMood} onClick={logMood}>
            Log Mood
          </Button>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            View Mood Analytics
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Mood Analytics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[1, 3]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(value) => {
                      return ["Sad", "Neutral", "Happy"][value - 1];
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mood Logged!</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Thanks!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
