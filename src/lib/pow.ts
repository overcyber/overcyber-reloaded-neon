// Proof-of-Work cliente: encontra solução tal que SHA-256(nonce + ":" + solution)
// tenha `difficulty` bits zero no prefixo. Executa em chunks via requestIdleCallback-ish
// para não travar a UI. Para difficulty=18 leva tipicamente <1s.
//
// IMPORTANTE: Usa crypto.subtle.digest() quando disponível (HTTPS ou localhost).
// Quando não disponível (HTTP em IP de rede), usa fallback SHA-256 em JS puro.

import { api } from "./api";

export interface PowChallenge {
  nonce: string;
  difficulty: number;
}

export interface PowSolution {
  nonce: string;
  solution: string;
}

// ─── Pure JS SHA-256 fallback ────────────────────────────────────────
// Usado quando crypto.subtle não está disponível (ex: HTTP em IP de rede).
// Implementação padrão FIPS 180-4.

function jsSha256(message: string): Uint8Array {
  const chrsz = 8;

  // safeAdd — soma 32 bits com carry
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >>> 16) + (y >>> 16) + (lsw >>> 16);
    return ((msw & 0xffff) << 16) | (lsw & 0xffff);
  }

  function S(X: number, n: number): number { return (X >>> n) | (X << (32 - n)); }
  function R(X: number, n: number): number { return X >>> n; }
  function Ch(x: number, y: number, z: number): number { return (x & y) ^ (~x & z); }
  function Maj(x: number, y: number, z: number): number { return (x & y) ^ (x & z) ^ (y & z); }
  function Sigma0256(x: number): number { return S(x, 2) ^ S(x, 13) ^ S(x, 22); }
  function Sigma1256(x: number): number { return S(x, 6) ^ S(x, 11) ^ S(x, 25); }
  function Gamma0256(x: number): number { return S(x, 7) ^ S(x, 18) ^ R(x, 3); }
  function Gamma1256(x: number): number { return S(x, 17) ^ S(x, 19) ^ R(x, 10); }

  // Constantes K SHA-256
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // Converte string para array de words (big-endian)
  function str2binb(str: string): number[] {
    const bin: number[] = [];
    const mask = (1 << chrsz) - 1;
    for (let i = 0; i < str.length * chrsz; i += chrsz) {
      bin[i >>> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - (i % 32));
    }
    return bin;
  }

  // Converte array de 8 words (256 bits) para Uint8Array
  function binb2b32(bin: number[]): Uint8Array {
    const out = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      out[4 * i] = (bin[i] >>> 24) & 0xff;
      out[4 * i + 1] = (bin[i] >>> 16) & 0xff;
      out[4 * i + 2] = (bin[i] >>> 8) & 0xff;
      out[4 * i + 3] = bin[i] & 0xff;
    }
    return out;
  }

  // Core SHA-256
  function coreSHA256(m: number[], l: number): number[] {
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const W: number[] = new Array(64);

    m[l >>> 5] |= 0x80 << (24 - (l % 32));
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (let i = 0; i < m.length; i += 16) {
      let a = H[0], b = H[1], c = H[2], d = H[3];
      let e = H[4], f = H[5], g = H[6], h = H[7];

      for (let t = 0; t < 64; t++) {
        if (t < 16) W[t] = m[i + t];
        else W[t] = safeAdd(safeAdd(safeAdd(Gamma1256(W[t - 2]), W[t - 7]), Gamma0256(W[t - 15])), W[t - 16]);

        const T1 = safeAdd(safeAdd(safeAdd(safeAdd(h, Sigma1256(e)), Ch(e, f, g)), K[t]), W[t]);
        const T2 = safeAdd(Sigma0256(a), Maj(a, b, c));

        h = g; g = f; f = e; e = safeAdd(d, T1);
        d = c; c = b; b = a; a = safeAdd(T1, T2);
      }

      H[0] = safeAdd(a, H[0]); H[1] = safeAdd(b, H[1]);
      H[2] = safeAdd(c, H[2]); H[3] = safeAdd(d, H[3]);
      H[4] = safeAdd(e, H[4]); H[5] = safeAdd(f, H[5]);
      H[6] = safeAdd(g, H[6]); H[7] = safeAdd(h, H[7]);
    }

    return H;
  }

  const bin = str2binb(message);
  const hash = coreSHA256(bin, message.length * chrsz);
  return binb2b32(hash);
}

// ─── SHA-256 wrapper com fallback ────────────────────────────────────

async function sha256Hex(data: string): Promise<Uint8Array> {
  // crypto.subtle só existe em contextos seguros (HTTPS ou localhost)
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const enc = new TextEncoder().encode(data);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      return new Uint8Array(buf);
    } catch {
      // Se crypto.subtle.digest falhar (ex: CSP bloqueando), cai no fallback JS
    }
  }
  // Fallback JS puro quando crypto.subtle não está disponível
  // NOTA: jsSha256 usa str.charCodeAt() (UTF-16), enquanto nativo usa TextEncoder (UTF-8).
  // Para entrada ASCII (nonce + ":" + solution) ambos produzem o mesmo resultado.
  return jsSha256(data);
}

// ─── PoW solver ──────────────────────────────────────────────────────

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
