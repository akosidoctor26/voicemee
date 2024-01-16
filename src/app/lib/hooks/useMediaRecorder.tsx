import { useRef, useState } from "react";

enum RecordingStates {
  Inactive = "inactive",
  Recording = "recording",
  Paused = "paused",
  Recorded = "recorded",
}

interface IUseMediaRecorder {
  mediaStreamConstraints?: { audio: boolean; video: boolean };
  mediaRecorderOptions?: { type: string };
  onStart?: () => any;
  onResume?: () => any;
  onPause?: () => any;
  onStop?: (e: Event, p: { mediaBlob: Blob }) => any;
  onError?: (e: Event) => any;
}

const mimeType = "audio/webm";
const useMediaRecorder = ({
  mediaStreamConstraints = { audio: true, video: false },
  mediaRecorderOptions = { type: mimeType },
  onStart = () => {},
  onResume = () => {},
  onPause = () => {},
  onStop: onCustomStop = () => {},
  onError = () => {},
}: IUseMediaRecorder) => {
  // Refs
  const mediaStream = useRef<MediaStream>();
  const mediaRecorder = useRef<MediaRecorder>();
  const mediaChunks = useRef<Blob[]>([]);

  // States
  const [mediaBlob, setMediaBlob] = useState<Blob>();
  const [status, setStatus] = useState<RecordingState>(
    RecordingStates.Inactive
  );

  //#region Event Handlers
  const onStop = (event: Event) => {
    const mediaBlob = new Blob(mediaChunks.current, mediaRecorderOptions);
    setMediaBlob(mediaBlob);
    console.log(`Recording Status: ${status}`);

    onCustomStop(event, { mediaBlob });
  };

  const onDataAvailable = (ev: BlobEvent) => {
    if (ev?.data && ev.data.size > 0) {
      mediaChunks.current?.push(ev.data);
    }
  };

  //#endregion

  const getMediaStream = async () => {
    // Get stream from media devices
    try {
      const tmpMediaStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints
      );
      mediaStream.current = tmpMediaStream;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  // #region Triggers
  const startRecording = async () => {
    if (!mediaStream?.current) {
      await getMediaStream();
    }
    // setup MediaRecorder
    mediaRecorder.current = new MediaRecorder(mediaStream.current!, {
      mimeType: mediaRecorderOptions.type,
    });

    mediaRecorder.current.onstart = onStart;
    mediaRecorder.current.onpause = onPause;
    mediaRecorder.current.onresume = onResume;
    mediaRecorder.current.onstop = onStop;
    mediaRecorder.current.ondataavailable = onDataAvailable;
    mediaRecorder.current.onerror = onError;
    mediaRecorder.current.start();
    setStatus(mediaRecorder?.current?.state);
    console.log(`Recording Status: ${mediaRecorder?.current?.state}`);
  };

  const stopRecording = async () => {
    if (!mediaRecorder?.current) return;

    mediaRecorder?.current?.stop?.();
    setStatus(mediaRecorder?.current?.state);
    mediaChunks.current = [];
  };

  const resumeRecording = async () => {
    if (mediaRecorder?.current?.state === RecordingStates.Paused) {
      mediaRecorder?.current?.resume();
    }
  };

  const pauseRecording = async () => {
    if (mediaRecorder?.current?.state === RecordingStates.Recording) {
      mediaRecorder?.current?.resume();
    }
  };

  // #endregion

  return {
    startRecording,
    stopRecording,
    resumeRecording,
    pauseRecording,
    mediaBlob,
    status,
  };
};

export default useMediaRecorder;
export { RecordingStates };
