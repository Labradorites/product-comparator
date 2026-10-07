import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Matches src/ui.html ("Hyperlane" direction).
export const display = loadUnbounded("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;

export const mono = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  bg: "#04060c",
  fg: "#eaf6ff",
  muted: "#9db4c6",
  line: "#1b2b3b",
  accent: "#8052ff",
  amber: "#ffb829",
  warn: "#f0a84b",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
