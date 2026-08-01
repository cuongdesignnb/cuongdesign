export function isIcoFile(source: Uint8Array) {
  return source.length >= 4 &&
    source[0] === 0x00 &&
    source[1] === 0x00 &&
    source[2] === 0x01 &&
    source[3] === 0x00;
}
