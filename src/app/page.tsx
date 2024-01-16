"use client";

import { useEffect, useRef, useState } from "react";
import cn from "classnames";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import useMediaRecorder, {
  RecordingStates,
} from "./lib/hooks/useMediaRecorder";
import { MessageTypes } from "./lib/workers/constants";
import MediaButton from "./lib/components/media-button";
import Button from "./lib/components/button";
import Spinner from "./lib/components/spinner";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcribeWorker = useRef<Worker>();

  const { startRecording, stopRecording, status, mediaBlob } = useMediaRecorder(
    {
      onStop: (_, { mediaBlob }) => {
        audioRef.current!.src = URL.createObjectURL(mediaBlob);
      },
    }
  );

  const [transcribedText, setTranscribedText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transcribeWorker.current) {
      transcribeWorker.current = new Worker(
        new URL("./lib/workers/transcribe.worker.tsx", import.meta.url),
        { type: "module" }
      );
    }

    const onMessageReceived = (e: any) => {
      switch (e.data.type) {
        case MessageTypes.LOADING:
          setLoading(true);
          break;
        case MessageTypes.RESULT:
          setTranscribedText(e.data?.result?.text);
          setLoading(false);
          break;

        default:
          break;
      }
    };

    transcribeWorker.current.addEventListener("message", onMessageReceived);
    return () =>
      transcribeWorker.current?.removeEventListener(
        "message",
        onMessageReceived
      );
  }, []);

  const decodeAudio = async () => {
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await mediaBlob?.arrayBuffer?.();
    const decodedAudioData = await audioCtx.decodeAudioData(arrayBuffer!);
    const audio = decodedAudioData.getChannelData(0);

    return audio;
  };

  const handleTranscribe = async () => {
    if (!mediaBlob) return;

    let audio = await decodeAudio();
    const model_name = `openai/whisper-tiny.en`;

    transcribeWorker.current!.postMessage({
      type: MessageTypes.TRANSCRIBE,
      audio,
      model_name,
    });
  };

  const handleReset = () => {
    audioRef.current?.removeAttribute("src");
    setTranscribedText("");
  };

  return (
    <div className="container min-h-screen min-w-full">
      <nav className="flex flex-col items-center w-full px-4 py-20">
        <Image src="/images/logo2.png" alt="logo" width="400" height="100" />
        <p className="text-gray-800">
          Transcribe directly from your browser using AI.
        </p>
      </nav>
      <section className="min-w-full flex flex-col items-center justify-center py-16 gap-10">
        <MediaButton
          status={audioRef.current?.src ? RecordingStates.Recorded : status}
          onRecord={startRecording}
          onStop={stopRecording}
          onReset={handleReset}
        />
        <div
          className={cn("flex items-center gap-4", {
            "opacity-0": !audioRef?.current?.src,
          })}
        >
          <audio ref={audioRef} controls className="min-w-full">
            Your browser does not support the audio element.
          </audio>
          <a title="Download" href={audioRef?.current?.src || "#"} download>
            <button className="w-8 p-2 text-gray-700 hover:bg-gray-200 rounded-full">
              <ArrowDownTrayIcon />
            </button>
          </a>
        </div>
        {audioRef?.current?.src && !transcribedText && (
          <Button onClick={handleTranscribe}>Transcribe</Button>
        )}

        {loading && <Spinner />}

        {transcribedText && (
          <textarea
            className="w-96 p-4 resize text-lg text-gray-700 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={transcribedText}
            readOnly={true}
          ></textarea>
        )}
      </section>
    </div>
  );
}
