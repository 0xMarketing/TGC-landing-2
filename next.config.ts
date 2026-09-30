import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Evita que `next dev` añada su propio bloque a CLAUDE.md — ese archivo ya
  // contiene las instrucciones del proyecto y no queremos que se mezcle.
  agentRules: false,
};

export default nextConfig;
