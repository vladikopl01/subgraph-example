import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert } from "matchstick-as";
import { Token, User } from "../../generated/schema";

export function assertTxData<T extends ethereum.Event>(event: T): void {
  const txDataId = event.transaction.hash.concatI32(event.logIndex.toI32());
  assert.fieldEquals(
    "TransactionData",
    txDataId.toHex(),
    "blockNumber",
    event.block.number.toString()
  );
  assert.fieldEquals(
    "TransactionData",
    txDataId.toHex(),
    "blockTimestamp",
    event.block.timestamp.toString()
  );
  assert.fieldEquals(
    "TransactionData",
    txDataId.toHex(),
    "transactionHash",
    event.transaction.hash.toHex()
  );
}

export function assertUser(userId: string, balance: BigInt): void {
  const user = User.load(userId);
  assert.assertNotNull(user);
  assert.fieldEquals("User", userId, "balance", balance.toString());
}

export function assertToken(
  tokenId: BigInt,
  creator: Bytes,
  owner: Bytes
): void {
  const token = Token.load(tokenId.toString());
  assert.assertNotNull(token);
  assert.fieldEquals("Token", tokenId.toString(), "creator", creator.toHex());
  assert.fieldEquals("Token", tokenId.toString(), "owner", owner.toHex());
}
