import { useEffect, useRef, useState } from "react";

interface ParsedData {
  max: number;
  peaks: number[];
}

async function calculate(data: ArrayBuffer): Promise<ParsedData> {
  const audioCtx = new AudioContext();
  const buffer = await audioCtx.decodeAudioData(data.slice(0));

  const leftData = Array.from(buffer.getChannelData(0)).map(Math.abs);
  const rightData = Array.from(buffer.getChannelData(1)).map(Math.abs);
  const normalized = leftData.map((l, i) => (l + rightData[i]!) / 2);

  const chunkSize = Math.ceil(normalized.length / 100);
  const peaks: number[] = [];
  for (let i = 0; i < 100; i++) {
    const chunk = normalized.slice(i * chunkSize, (i + 1) * chunkSize);
    peaks.push(chunk.reduce((a, b) => a + b, 0) / chunk.length);
  }

  const max = Math.max(...peaks);
  return { max, peaks };
}

interface Props {
  soundData: ArrayBuffer;
}

export const SoundWaveSVG = ({ soundData }: Props) => {
  const uniqueIdRef = useRef(Math.random().toString(16));
  const [{ max, peaks }, setPeaks] = useState<ParsedData>({
    max: 0,
    peaks: [],
  });

  useEffect(() => {
    calculate(soundData).then(({ max, peaks }) => {
      setPeaks({ max, peaks });
    });
  }, [soundData]);

  return (
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 1">
      {peaks.map((peak, idx) => {
        const ratio = peak / max;
        return (
          <rect
            key={`${uniqueIdRef.current}#${idx}`}
            fill="var(--color-cax-accent)"
            height={ratio}
            width="1"
            x={idx}
            y={1 - ratio}
          />
        );
      })}
    </svg>
  );
};
