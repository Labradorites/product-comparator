import type React from "react";
import { C } from "./theme";

export const LogoMark: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="7" y="22" width="40" height="20" rx="4" stroke={C.accent} strokeWidth="3" />
    <path d="M47 26.5h7M47 32h7M47 37.5h7" stroke={C.accent} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M14.5 37L20 27l5.5 10z" fill={C.amber} />
  </svg>
);
