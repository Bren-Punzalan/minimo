"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimerMode {
  name: string;
  workTime: number;
  breakTime: number;
  isCustom?: boolean;
}

const timerModes: TimerMode[] = [
  { name: "Light Work", workTime: 25, breakTime: 5 },
  { name: "Deep Work", workTime: 50, breakTime: 10 },
  { name: "Quick Break", workTime: 10, breakTime: 2 },
  { name: "Custom", workTime: 25, breakTime: 5, isCustom: true },
];

const TIMER_SOUND =
  "https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3";

export default function PomodoroTimer() {
  const [selectedMode, setSelectedMode] = useState<TimerMode>(timerModes[0]);
  const [time, setTime] = useState(selectedMode.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [showTimeControls, setShowTimeControls] = useState(false);

  // Use useRef for audio instead of useState
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(TIMER_SOUND);
    }
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      if (isWorkTime) {
        setIsActive(false);
        setShowBreakDialog(true);
        playSound();
      } else {
        setTime(selectedMode.workTime * 60);
        setIsWorkTime(true);
        setIsActive(false);
        playSound();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, isWorkTime, selectedMode]);

  // Rest of the component remains the same...
  const handleTimeAdjust = (amount: number, unit: "minutes" | "seconds") => {
    if (isActive) return;
    const multiplier = unit === "minutes" ? 60 : 1;
    setTime((prev) => Math.max(0, Math.min(5999, prev + amount * multiplier)));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getBackgroundColor = (): string => {
    if (!isActive) return "";
    return selectedMode.name === "Quick Break" || !isWorkTime
      ? "bg-blue-100 dark:bg-blue-500"
      : "bg-red-100 dark:bg-red-500";
  };

  const getTextColor = (): string => {
    if (!isActive) return "";
    return selectedMode.name === "Quick Break" || !isWorkTime
      ? "text-blue-900 dark:text-blue-100"
      : "text-red-900 dark:text-red-100";
  };

  const getButtonVariant = (
    isActive: boolean,
    isBreakTime: boolean
  ): "default" | "destructive" | "outline" | "secondary" | "ghost" => {
    if (!isActive) return "default";
    return isBreakTime ? "secondary" : "destructive";
  };

  return (
    <>
      <Card
        className={`w-full mx-auto transition-colors ${getBackgroundColor()}`}
      >
        <CardHeader>
          <CardTitle>Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className={`text-center space-y-4 ${getTextColor()}`}>
          <Select
            onValueChange={(name) => {
              const mode = timerModes.find((m) => m.name === name);
              if (mode) {
                setSelectedMode(mode);
                setTime(mode.workTime * 60);
                setIsWorkTime(true);
                setIsActive(false);
              }
            }}
            value={selectedMode.name}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timer mode" />
            </SelectTrigger>
            <SelectContent>
              {timerModes.map((mode) => (
                <SelectItem key={mode.name} value={mode.name}>
                  {mode.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMode.isCustom && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workTime">Work Time (min)</Label>
                <Input
                  id="workTime"
                  type="number"
                  min="1"
                  value={customWork}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setCustomWork(value);
                    if (isWorkTime) setTime(value * 60);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakTime">Break Time (min)</Label>
                <Input
                  id="breakTime"
                  type="number"
                  min="1"
                  value={customBreak}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setCustomBreak(value);
                    if (!isWorkTime) setTime(value * 60);
                  }}
                />
              </div>
            </div>
          )}

          <div
            className="flex justify-center items-center space-x-8"
            onMouseEnter={() =>
              !selectedMode.isCustom && setShowTimeControls(true)
            }
            onMouseLeave={() =>
              !selectedMode.isCustom && setShowTimeControls(false)
            }
          >
            {!selectedMode.isCustom && (
              <div
                className={`flex flex-col ${
                  showTimeControls ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                <button
                  onClick={() => handleTimeAdjust(1, "minutes")}
                  disabled={isActive}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => handleTimeAdjust(-1, "minutes")}
                  disabled={isActive}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            )}

            <div className="text-4xl font-bold">{formatTime(time)}</div>

            {!selectedMode.isCustom && (
              <div
                className={`flex flex-col ${
                  showTimeControls ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                <button
                  onClick={() => handleTimeAdjust(1, "seconds")}
                  disabled={isActive}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => handleTimeAdjust(-1, "seconds")}
                  disabled={isActive}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isWorkTime ? "Work Time" : "Break Time"}
          </div>

          <div className="space-x-2">
            <Button
              variant={getButtonVariant(
                isActive,
                !isWorkTime || selectedMode.name === "Quick Break"
              )}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Pause" : "Start"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTime(selectedMode.workTime * 60);
                setIsWorkTime(true);
                setIsActive(false);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showBreakDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Work Period Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to start your {selectedMode.breakTime} minute break
              now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setTime(selectedMode.workTime * 60);
                setIsWorkTime(true);
                setShowBreakDialog(false);
              }}
            >
              Skip Break
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setTime(selectedMode.breakTime * 60);
                setIsWorkTime(false);
                setIsActive(true);
                setShowBreakDialog(false);
              }}
            >
              Start Break
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
