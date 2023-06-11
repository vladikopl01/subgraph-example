import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  clearStore,
  describe,
  log,
  test,
} from "matchstick-as/assembly/index";
import {
  handleApproval,
  handleApprovalForAll,
  handleOwnershipTransferred,
  handleTransfer,
} from "../src/mappings";
import { assertToken, assertTxData, assertUser } from "./shared/asserts";
import { createMockedToken, createMockedUser } from "./shared/mocks/entity";
import {
  createApprovalEvent,
  createApprovalForAllEvent,
  createOwnershipTransferredEvent,
  createTransferEvent,
} from "./shared/mocks/event";
import { createAddress, createZeroAddress } from "./shared/utils";

const bobAddress = createAddress("bob");
const aliceAddress = createAddress("alice");

describe("NFT mappings", function() {
  beforeAll(function() {
    log.info("bobAddress: {}", [bobAddress.toHex()]);
    log.info("aliceAddress: {}", [aliceAddress.toHex()]);
  });

  afterEach(function() {
    clearStore();
  });

  describe("handleOwnershipTransferred", function() {
    const entityType = "OwnershipTransferred";

    test("success - creates OwnershipTransferred", function() {
      const prevOwner = bobAddress;
      const newOwner = aliceAddress;

      const event = createOwnershipTransferredEvent(prevOwner, newOwner);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleOwnershipTransferred(event);

      assert.fieldEquals(entityType, id, "previousOwner", prevOwner.toHex());
      assert.fieldEquals(entityType, id, "newOwner", newOwner.toHex());
      assertTxData(event);
    });
  });

  describe("handleApproval", function() {
    const entityType = "Approval";

    test("success - creates Approval", function() {
      const owner = bobAddress;
      const approved = aliceAddress;
      const tokenId = BigInt.fromI32(1);

      const creatorMock = createMockedUser(approved);
      const ownerMock = createMockedUser(owner, BigInt.fromI32(1));
      const token = createMockedToken(tokenId, creatorMock.id, ownerMock.id);

      const event = createApprovalEvent(owner, approved, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleApproval(event);

      assert.fieldEquals(entityType, id, "token", token.id);
      assert.fieldEquals(entityType, id, "approved", approved.toHex());
      assertTxData(event);
    });

    test("fail - does not create Approval (token not exists)", function() {
      const owner = bobAddress;
      const approved = aliceAddress;
      const tokenId = BigInt.fromI32(999);

      const event = createApprovalEvent(owner, approved, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleApproval(event);

      assert.notInStore(entityType, id);
    });
  });

  describe("handleApprovalForAll", function() {
    const entityType = "ApprovalForAll";

    test("success - creates ApprovalForAll", function() {
      const owner = bobAddress;
      const operator = aliceAddress;
      const approved = true;

      const ownerMock = createMockedUser(bobAddress);

      const event = createApprovalForAllEvent(owner, operator, approved);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleApprovalForAll(event);

      assert.fieldEquals(entityType, id, "owner", ownerMock.id);
      assert.fieldEquals(entityType, id, "operator", operator.toHex());
      assert.fieldEquals(entityType, id, "approved", "true");
      assertTxData(event);
    });

    test("fail - does not create ApprovalForAll (owner not exists)", function() {
      const owner = bobAddress;
      const operator = aliceAddress;
      const approved = true;

      const event = createApprovalForAllEvent(owner, operator, approved);

      handleApprovalForAll(event);
    });
  });

  describe("handleTransfer", function() {
    const entityType = "Transfer";

    test("success - minting token, creator exists", function() {
      const from = createZeroAddress();
      const to = bobAddress;
      const tokenId = BigInt.fromI32(1);

      const creatorMock = createMockedUser(bobAddress);

      const event = createTransferEvent(from, to, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleTransfer(event);

      assert.fieldEquals(entityType, id, "token", tokenId.toString());
      assert.fieldEquals(entityType, id, "from", from.toHex());
      assert.fieldEquals(entityType, id, "to", to.toHex());
      assertUser(creatorMock.id, creatorMock.balance.plus(BigInt.fromI32(1)));
      assertTxData(event);
    });

    test("success - minting token, creator not exists", function() {
      const from = createZeroAddress();
      const to = bobAddress;
      const tokenId = BigInt.fromI32(1);

      const event = createTransferEvent(from, to, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleTransfer(event);

      assert.fieldEquals(entityType, id, "token", tokenId.toString());
      assert.fieldEquals(entityType, id, "from", from.toHex());
      assert.fieldEquals(entityType, id, "to", to.toHex());
      assertUser(to.toHex(), BigInt.fromI32(1));
      assertTxData(event);
    });

    test("success - transfer token, owner and receiver exists", function() {
      const from = bobAddress;
      const to = aliceAddress;
      const tokenId = BigInt.fromI32(1);

      const ownerMock = createMockedUser(from, BigInt.fromI32(1));
      const receiverMock = createMockedUser(to);
      const tokenMock = createMockedToken(tokenId, ownerMock.id, ownerMock.id);

      const event = createTransferEvent(from, to, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleTransfer(event);

      assert.fieldEquals(entityType, id, "token", tokenId.toString());
      assert.fieldEquals(entityType, id, "from", from.toHex());
      assert.fieldEquals(entityType, id, "to", to.toHex());
      assertUser(ownerMock.id, ownerMock.balance.minus(BigInt.fromI32(1)));
      assertUser(receiverMock.id, receiverMock.balance.plus(BigInt.fromI32(1)));
      assertToken(
        BigInt.fromString(tokenMock.id),
        Bytes.fromHexString(tokenMock.owner),
        Bytes.fromHexString(receiverMock.id)
      );
      assertTxData(event);
    });

    test("success - transfer token, receiver not exists", function() {
      const from = bobAddress;
      const to = aliceAddress;
      const tokenId = BigInt.fromI32(1);

      const ownerMock = createMockedUser(from, BigInt.fromI32(1));
      const tokenMock = createMockedToken(tokenId, ownerMock.id, ownerMock.id);

      const event = createTransferEvent(from, to, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      handleTransfer(event);

      assert.fieldEquals(entityType, id, "token", tokenId.toString());
      assert.fieldEquals(entityType, id, "from", from.toHex());
      assert.fieldEquals(entityType, id, "to", to.toHex());
      assertUser(ownerMock.id, ownerMock.balance.minus(BigInt.fromI32(1)));
      assertUser(to.toHex(), BigInt.fromI32(1));
      assertToken(
        BigInt.fromString(tokenMock.id),
        Bytes.fromHexString(tokenMock.owner),
        Bytes.fromHexString(to.toHex())
      );
      assertTxData(event);
    });
  });
});
