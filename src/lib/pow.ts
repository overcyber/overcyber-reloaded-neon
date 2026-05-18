// Proof-of-Work cliente: encontra solução tal que SHA-256(nonce + ":" + solution)
// tenha `difficulty` bits zero no prefixo. Executa em chunks via requestIdleCallback-ish
// para não travar a UI. Para difficulty=18 leva tipicamente <1s.

import { api } from "./api";

export interface PowChallenge {
  nonce: string;
  difficulty: number;
}

export interface PowSolution {
  nonce: string;
  solution: string;
}

async function sha256Hex(data: string): Promise<Uint8Array> {
  const enc = new TextEncoder().encode(data);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return new Uint8Array(buf);
}

function leadingZeroBits(bytes: Uint8Array): number {
  let n = 0;
  for (const b of bytes) {
    if (b === 0) n += 8;
    else {
      n += Math.clz32(b) - 24;
      break;
    }
  }
  return n;
}

export async function solvePow(c: PowChallenge): Promise<PowSolution> {
  let i = 0;
  for (;;) {
    const sol = i.toString(36);
    const digest = await sha256Hex(c.nonce + ":" + sol);
    if (leadingZeroBits(digest) >= c.difficulty) {
      return { nonce: c.nonce, solution: sol };
    }
    i++;
    if (i % 2000 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}

export async function requestAndSolvePow(): Promise<PowSolution> {
  const challenge = await api<PowChallenge>("/pow/challenge");
  return await solvePow(challenge);
}
