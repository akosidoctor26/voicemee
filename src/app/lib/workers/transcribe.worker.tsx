import { pipeline } from "@xenova/transformers";
import { MessageTypes } from "./constants";

class TranscribePipeline {
  static task = "automatic-speech-recognition";
  static model = "openai/whisper-tiny.en";
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (!this.instance) {
      this.instance = pipeline(this.task, undefined, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  if (event.data.type === MessageTypes.TRANSCRIBE) {
    const { audio } = event.data;

    const finalResult = await transcribe(audio);

    self.postMessage({
      type: MessageTypes.RESULT,
      result: finalResult,
    });
  }
});

async function transcribe(audio: HTMLAudioElement) {
  // send loading message
  self.postMessage({
    type: MessageTypes.LOADING,
  });

  let pipeline = null;
  try {
    pipeline = await TranscribePipeline.getInstance();
  } catch (error: any) {
    console.log(error.message);
    self.postMessage({ type: MessageTypes.ERROR, message: error.message });
  }

  // send loading message

  return await pipeline(audio, {
    top_k: 0,
    do_sample: false,
    chunk_length: 30,
    stride_length_s: 5,
    return_timestamps: true,
    // callback_function: (beams) => {
    //   const tokenIds = beams[0].output_token_ids;
    //   const result = pipeline.tokenizer.decode(tokenIds, {
    //     skip_special_token: true,
    //   });

    //   console.log('callback_function', result);
    // },
  });
}
