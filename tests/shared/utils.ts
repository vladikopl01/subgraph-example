import { Address, Bytes, crypto } from "@graphprotocol/graph-ts";

export function createAddress(input: string = ""): Address {
  const inputBytes = Bytes.fromUTF8(input);
  const hashBytes = crypto.keccak256(inputBytes);
  const addressBytes = hashBytes.slice(12, 32);
  return Address.fromBytes(Bytes.fromUint8Array(addressBytes));
}

export function createZeroAddress(): Address {
  return Address.fromString("0x0000000000000000000000000000000000000000");
}
