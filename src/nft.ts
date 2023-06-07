import { Bytes } from "@graphprotocol/graph-ts";
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/NFT/NFT";
import {
  Approval,
  ApprovalForAll,
  Owner,
  OwnershipTransferred,
  Token,
  Transfer,
} from "../generated/schema";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let ownershipTransferred = new OwnershipTransferred(id);
  ownershipTransferred.previousOwner = event.params.previousOwner;
  ownershipTransferred.newOwner = event.params.newOwner;
  ownershipTransferred.save();
}

export function handleApproval(event: ApprovalEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let approval = new Approval(id);
  approval.owner = event.params.owner;
  approval.approved = event.params.approved;
  approval.tokenId = event.params.tokenId;

  // Handle owner field
  let ownerId = Bytes.fromHexString(event.params.owner.toHexString());
  let owner = Owner.load(ownerId);
  if (owner == null) {
    throw new Error("Owner not found");
  }
  approval.owner = owner.id;

  // Handle token field
  let tokenId = Bytes.fromHexString(event.params.tokenId.toHexString());
  let token = Token.load(tokenId);
  if (token == null) {
    throw new Error("Token not found");
  }
  approval.token = token.id;

  approval.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let approvalForAll = new ApprovalForAll(id);
  approvalForAll.owner = event.params.owner;
  approvalForAll.operator = event.params.operator;
  approvalForAll.approved = event.params.approved;

  // Handle owner field
  let ownerId = Bytes.fromHexString(event.params.owner.toHexString());
  let owner = Owner.load(ownerId);
  if (owner == null) {
    throw new Error("Owner not found");
  }
  approvalForAll.owner = owner.id;

  approvalForAll.save();
}

export function handleTransfer(event: TransferEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let transfer = new Transfer(id);
  transfer.from = event.params.from;
  transfer.to = event.params.to;

  // Handle token field
  let tokenId = Bytes.fromHexString(event.params.tokenId.toHexString());
  let token = Token.load(tokenId);
  if (token == null) {
    token = new Token(tokenId);
    // Handle owner field
    let ownerId = Bytes.fromHexString(event.params.from.toHexString());
    let owner = Owner.load(ownerId);
    if (owner == null) {
      owner = new Owner(ownerId);
      owner.save();
    }
    token.owner = owner.id;
    token.save();
  }
  transfer.token = token.id;

  transfer.save();
}
