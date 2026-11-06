import { useEffect, useId, useRef, useState } from "react";

export function InfoTip({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 16, top: 16 });
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <span
      className="info-tip"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          e.stopPropagation();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="info-trigger"
        aria-label={`About ${title}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const width = Math.min(270, window.innerWidth - 32);
          setPosition({
            left: Math.max(
              16,
              Math.min(rect.left, window.innerWidth - width - 16),
            ),
            top: Math.min(rect.bottom + 8, window.innerHeight - 160),
          });
          setOpen(!open);
        }}
      >
        i
      </button>
      {open && (
        <span id={id} className="info-content" role="note" style={position}>
          {description}
        </span>
      )}
    </span>
  );
}
