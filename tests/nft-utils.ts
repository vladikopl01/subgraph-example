import {
  Address,
  BigInt,
  Bytes,
  crypto,
  ethereum,
} from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Transfer,
} from "../generated/NFT/NFT";
import { Token } from "../generated/schema";

export function createAddress(input: string = ""): Address {
  const inputBytes = Bytes.fromUTF8(input);
  const hashBytes = crypto.keccak256(inputBytes);
  const addressBytes = hashBytes.slice(12, 32);
  return Address.fromBytes(Bytes.fromUint8Array(addressBytes));
}

export function createToken(
  id: Bytes,
  creatorId: string,
  ownerId: string
): Token {
  let token = new Token(id.toString());
  token.owner = creatorId;
  token.creator = ownerId;
  token.save();
  return token;
}

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent());
  approvalEvent.parameters = new Array();

  let ownerParam = new ethereum.EventParam(
    "owner",
    ethereum.Value.fromAddress(owner)
  );
  let approvedParam = new ethereum.EventParam(
    "approved",
    ethereum.Value.fromAddress(approved)
  );
  let tokenIdParam = new ethereum.EventParam(
    "tokenId",
    ethereum.Value.fromUnsignedBigInt(tokenId)
  );

  approvalEvent.parameters.push(ownerParam);
  approvalEvent.parameters.push(approvedParam);
  approvalEvent.parameters.push(tokenIdParam);
  return approvalEvent;
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent());
  approvalForAllEvent.parameters = new Array();

  let ownerParam = new ethereum.EventParam(
    "owner",
    ethereum.Value.fromAddress(owner)
  );
  let operatorParam = new ethereum.EventParam(
    "operator",
    ethereum.Value.fromAddress(operator)
  );
  let approvedParam = new ethereum.EventParam(
    "approved",
    ethereum.Value.fromBoolean(approved)
  );

  approvalForAllEvent.parameters.push(ownerParam);
  approvalForAllEvent.parameters.push(operatorParam);
  approvalForAllEvent.parameters.push(approvedParam);
  return approvalForAllEvent;
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  );
  ownershipTransferredEvent.parameters = new Array();

  let previousOwnerParam = new ethereum.EventParam(
    "previousOwner",
    ethereum.Value.fromAddress(previousOwner)
  );
  let newOwnerParam = new ethereum.EventParam(
    "newOwner",
    ethereum.Value.fromAddress(newOwner)
  );

  ownershipTransferredEvent.parameters.push(previousOwnerParam);
  ownershipTransferredEvent.parameters.push(newOwnerParam);
  return ownershipTransferredEvent;
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent());
  transferEvent.parameters = new Array();

  let fromParam = new ethereum.EventParam(
    "from",
    ethereum.Value.fromAddress(from)
  );
  let toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(to));
  let tokenIdParam = new ethereum.EventParam(
    "tokenId",
    ethereum.Value.fromUnsignedBigInt(tokenId)
  );

  transferEvent.parameters.push(fromParam);
  transferEvent.parameters.push(toParam);
  transferEvent.parameters.push(tokenIdParam);
  return transferEvent;
}
