import { useEffect, useState } from "react";

const titles = [
  "illustrators",
  "painters",
  "sculptors",
  "designers",
  "engravers",
  "muralists",
  "portraitists",
  "printmakers",
  "cartoonists",
  "caricaturists",
  "visualists",
  "collagists",
  "calligraphers",
  "musicians",
  "artists",
];

export default function AutoTypingText() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const currentTitle = titles[titleIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const nextText = currentTitle.slice(0, text.length + 1);
          setText(nextText);

          if (nextText === currentTitle) {
            setIsPaused(true);

            setTimeout(() => {
              setIsPaused(false);
              setIsDeleting(true);
            }, 1000);
          }
        } else {
          const nextText = currentTitle.slice(0, text.length - 1);
          setText(nextText);

          if (nextText === "") {
            setIsPaused(true);

            setTimeout(() => {
              setIsPaused(false);
              setIsDeleting(false);
              setTitleIndex((prev) => (prev + 1) % titles.length);
            }, 1000);
          }
        }
      },
      isDeleting ? 50 : 90
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, titleIndex, isPaused]);

  return (
    <>
      {text}
    </>
  );
}
