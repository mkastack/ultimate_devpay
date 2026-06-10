/**
 * Tiny image inspector — no native deps; safe for Cloudflare Workers.
 * Detects MIME by magic bytes and pulls width/height from PNG/JPEG/GIF/WEBP.
 */

export type InspectedImage = {
  mime: "image/png" | "image/jpeg" | "image/gif" | "image/webp";
  width: number;
  height: number;
};

export function inspectImage(bytes: Uint8Array): InspectedImage | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A, then IHDR at offset 16 (width@16, height@20, big-endian)
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { mime: "image/png", width: v.getUint32(16), height: v.getUint32(20) };
  }
  // GIF87a / GIF89a
  if (
    bytes.length >= 10 &&
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46
  ) {
    const w = bytes[6] | (bytes[7] << 8);
    const h = bytes[8] | (bytes[9] << 8);
    return { mime: "image/gif", width: w, height: h };
  }
  // WEBP: 'RIFF'....'WEBP'
  if (
    bytes.length >= 30 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    // VP8X chunk has canvas size at offset 24 (3 bytes -1 each)
    const fourcc = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
    if (fourcc === "VP8X") {
      const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      return { mime: "image/webp", width: w, height: h };
    }
    if (fourcc === "VP8 ") {
      const w = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
      const h = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
      return { mime: "image/webp", width: w, height: h };
    }
    if (fourcc === "VP8L" && bytes.length >= 25) {
      const b0 = bytes[21], b1 = bytes[22], b2 = bytes[23], b3 = bytes[24];
      const w = 1 + (((b1 & 0x3f) << 8) | b0);
      const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { mime: "image/webp", width: w, height: h };
    }
  }
  // JPEG: FF D8, scan for SOFn marker
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i < bytes.length) {
      if (bytes[i] !== 0xff) return null;
      // skip fill bytes
      while (i < bytes.length && bytes[i] === 0xff) i++;
      const marker = bytes[i]; i++;
      if (marker === 0xd9 || marker === 0xda) return null; // EOI / SOS
      const len = (bytes[i] << 8) | bytes[i + 1];
      // SOF markers (Start Of Frame): C0-CF except C4, C8, CC
      const isSOF =
        marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF && i + 7 <= bytes.length) {
        const h = (bytes[i + 3] << 8) | bytes[i + 4];
        const w = (bytes[i + 5] << 8) | bytes[i + 6];
        return { mime: "image/jpeg", width: w, height: h };
      }
      i += len;
    }
  }
  return null;
}
