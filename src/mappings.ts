import { BigInt } from "@graphprotocol/graph-ts";
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/NFT/NFT";
import {
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Token,
  TransactionData,
  Transfer,
  User,
} from "../generated/schema";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let ownershipTransferred = new OwnershipTransferred(id);

  // Handle transaction data
  let transactionData = new TransactionData(id);
  transactionData.blockNumber = event.block.number;
  transactionData.blockTimestamp = event.block.timestamp;
  transactionData.transactionHash = event.transaction.hash;
  transactionData.save();

  ownershipTransferred.previousOwner = event.params.previousOwner;
  ownershipTransferred.newOwner = event.params.newOwner;
  ownershipTransferred.transactionData = transactionData.id;
  ownershipTransferred.save();
}

export function handleApproval(event: ApprovalEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let approval = new Approval(id);

  // Handle token
  let token = Token.load(event.params.tokenId.toString());
  if (token == null) return;

  // Handle transaction data
  let transactionData = new TransactionData(id);
  transactionData.blockNumber = event.block.number;
  transactionData.blockTimestamp = event.block.timestamp;
  transactionData.transactionHash = event.transaction.hash;
  transactionData.save();

  approval.approved = event.params.approved;
  approval.token = token.id;
  approval.transactionData = transactionData.id;
  approval.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let approvalForAll = new ApprovalForAll(id);

  // Handle owner
  let owner = User.load(event.params.owner.toHex());
  if (owner == null) return;

  // Handle transaction data
  let transactionData = new TransactionData(id);
  transactionData.blockNumber = event.block.number;
  transactionData.blockTimestamp = event.block.timestamp;
  transactionData.transactionHash = event.transaction.hash;
  transactionData.save();

  approvalForAll.operator = event.params.operator;
  approvalForAll.approved = event.params.approved;
  approvalForAll.owner = owner.id;
  approvalForAll.transactionData = transactionData.id;
  approvalForAll.save();
}

export function handleTransfer(event: TransferEvent): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let transfer = new Transfer(id);
  transfer.from = event.params.from;
  transfer.to = event.params.to;

  // Handle token
  let token = Token.load(event.params.tokenId.toString());
  if (token == null) {
    token = new Token(event.params.tokenId.toString());

    let creator = User.load(event.params.to.toHex());
    if (creator == null) {
      creator = new User(event.params.to.toHex());
      creator.balance = BigInt.fromI32(1);
    } else {
      creator.balance = creator.balance.plus(BigInt.fromI32(1));
    }
    creator.save();

    token.creator = creator.id;
    token.owner = creator.id;
    token.save();
  } else {
    let owner = User.load(event.params.from.toHex());
    // Will not happen as owner is always set if token exists
    if (owner == null) return;
    owner.balance = owner.balance.minus(BigInt.fromI32(1));
    owner.save();

    let receiver = User.load(event.params.to.toHex());
    if (receiver == null) {
      receiver = new User(event.params.to.toHex());
      receiver.balance = BigInt.fromI32(1);
    } else {
      receiver.balance = receiver.balance.plus(BigInt.fromI32(1));
    }
    receiver.save();

    token.owner = receiver.id;
    token.save();
  }

  // Handle transaction data
  let transactionData = new TransactionData(id);
  transactionData.blockNumber = event.block.number;
  transactionData.blockTimestamp = event.block.timestamp;
  transactionData.transactionHash = event.transaction.hash;
  transactionData.save();

  transfer.token = token.id;
  transfer.transactionData = transactionData.id;
  transfer.save();
}
