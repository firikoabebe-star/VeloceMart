"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface LandingState {
  activeGroup: string;
  setActiveGroup: (label: string) => void;
}

const LandingContext = createContext<LandingState>({
  activeGroup: "",
  setActiveGroup: () => {},
});

export function useLanding() {
  return useContext(LandingContext);
}

export default function LandingStateProvider({
  initialGroup,
  children,
}: {
  initialGroup: string;
  children: ReactNode;
}) {
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  return (
    <LandingContext.Provider value={{ activeGroup, setActiveGroup }}>
      {children}
    </LandingContext.Provider>
  );
}
