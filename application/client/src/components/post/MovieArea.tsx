import { useEffect, useRef, useState } from "react";
import { PausableMovie } from "@web-speed-hackathon-2026/client/src/components/foundation/PausableMovie";
import { getMoviePath } from "@web-speed-hackathon-2026/client/src/utils/get_path";

interface Props {
  movie: Models.Movie;
}

export const MovieArea = ({ movie }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="border-cax-border bg-cax-surface-subtle relative w-full overflow-hidden rounded-lg border"
      style={{ aspectRatio: "1 / 1" }}
      data-movie-area
    >
      {visible && <PausableMovie src={getMoviePath(movie.id)} />}
    </div>
  );
};
