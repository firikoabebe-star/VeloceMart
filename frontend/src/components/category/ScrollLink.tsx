"use client";

import type { MouseEvent, ReactNode } from "react";

export default function ScrollLink({
  target,
  className,
  children,
  ariaLabel,
}: {
  target: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${target}`);
  };

  return (
    <a href={`#${target}`} onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
