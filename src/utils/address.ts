import { zeroPad } from "ethers/lib/utils"

export const ZERO_ADDR = "0x0000000000000000000000000000000000000000"

export function isZeroAddr(addr: string) {
  return addr == ZERO_ADDR
}