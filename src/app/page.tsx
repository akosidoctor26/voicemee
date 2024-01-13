"use client";

import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";
import useMediaRecorder, {
  RecordingStates,
} from "./lib/hooks/useMediaRecorder";
import cn from "classnames";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const worker = useRef<Worker>();

  const { startRecording, stopRecording, status } = useMediaRecorder({
    onStop: (_, { mediaBlob }) => {
      audioRef.current!.src = URL.createObjectURL(mediaBlob);
      console.log(audioRef.current!.src);
    },
  });

  useEffect(() => {
    console.log(import.meta.url);
    if (!worker.current) {
      worker.current = new Worker(
        new URL("./lib/workers/transcribe.worker.tsx", import.meta.url),
        { type: "module" }
      );
    }
  }, []);

  const ButtonIcon = {
    [RecordingStates.Inactive]: <MicrophoneIcon />,
    [RecordingStates.Recording]: <StopIcon />,
    [RecordingStates.Paused]: <StopIcon />,
  }[status];

  return (
    <main className="container h-screen mx-auto flex">
      <aside className="w-1/3 p-4 border-r-2 ">History here</aside>
      <section className="w-2/3 p-4 flex flex-col items-center h-full justify-center">
        <button
          className="bg-red-800 text-white p-4 rounded-full w-24"
          onClick={
            status === RecordingStates.Recording
              ? stopRecording
              : startRecording
          }
        >
          {ButtonIcon}
        </button>
        <audio
          ref={audioRef}
          className={cn("w-full", { "opacity-0": !audioRef?.current?.src })}
          controls
        >
          Your browser does not support the audio element.
        </audio>
        {audioRef?.current?.src && (
          <a href={audioRef?.current?.src || "#"} download>
            Download
          </a>
        )}
      </section>
    </main>
  );
}
