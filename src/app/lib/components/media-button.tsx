import React from "react";
import {
  ArrowPathIcon,
  MicrophoneIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { RecordingStates } from "../hooks/useMediaRecorder";

type MediaButtonProps = {
  onRecord: () => void;
  onStop: () => void;
  onReset: () => void;
  status: string;
};

function MediaButton({ onRecord, onStop, onReset, status }: MediaButtonProps) {
  const ButtonIcon = {
    [RecordingStates.Inactive]: <MicrophoneIcon />,
    [RecordingStates.Recording]: <StopIcon />,
    [RecordingStates.Paused]: <StopIcon />,
    [RecordingStates.Recorded]: <ArrowPathIcon />,
  }[status];

  const onClickHandler = {
    [RecordingStates.Inactive]: onRecord,
    [RecordingStates.Recording]: onStop,
    [RecordingStates.Paused]: onStop,
    [RecordingStates.Recorded]: onReset,
  }[status];

  const title = {
    [RecordingStates.Inactive]: "Record",
    [RecordingStates.Recording]: "Stop",
    [RecordingStates.Paused]: "Stop",
    [RecordingStates.Recorded]: "Reset",
  }[status];

  return (
    <button
      className="bg-[#27265C] hover:bg-[#15135C] text-white p-8 rounded-full w-40"
      onClick={onClickHandler}
      title={title}
    >
      {ButtonIcon}
    </button>
  );
}

export default MediaButton;
