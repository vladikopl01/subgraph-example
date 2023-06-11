import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Token, User } from "../../../generated/schema";

export function createMockedUser(
  address: Address,
  balance: BigInt = BigInt.fromI32(0)
): User {
  const user = new User(address.toHex());
  user.balance = balance;
  user.save();
  return user;
}

export function createMockedToken(
  id: BigInt,
  creatorId: string,
  ownerId: string
): Token {
  const token = new Token(id.toString());
  token.creator = creatorId;
  token.owner = ownerId;
  token.save();
  return token;
}
