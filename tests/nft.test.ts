import {
  afterEach,
  assert,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { handleOwnershipTransferred } from "../src/nft";
import { createAddress, createOwnershipTransferredEvent } from "./nft-utils";
import { BigInt } from "@graphprotocol/graph-ts";

const bobAddress = createAddress("bob");
const aliceAddress = createAddress("alice");

describe("NFT mappings", function() {
  afterEach(function() {
    clearStore();
  });

  describe("handleOwnershipTransferred", function() {
    test("should create a new OwnershipTransferred entity", function() {
      // Create mock event
      const event = createOwnershipTransferredEvent(bobAddress, aliceAddress);

      // Get id and entity for assertions
      const entity = "OwnershipTransferred";
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();

      // Call handler
      handleOwnershipTransferred(event);

      // Check that entity was created
      assert.fieldEquals(entity, id, "previousOwner", bobAddress.toHex());
      assert.fieldEquals(entity, id, "newOwner", aliceAddress.toHex());
    });
  });

  describe("handleApproval", function() {
    test("should create a new Approval entity", function() {
      const tokenId = BigInt.fromString("1");
      const owner = createOwnerEntity();
      const token = new Token(Bytes.fromHexString(tokenId.toString()));
      token.save();
      const event = createApprovalEvent(bobAddress, aliceAddress, tokenId);
      const id = event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .toHex();
      handleApproval(event);
      assert.fieldEquals("Approval", id, "owner", bobAddress.toHex());
      assert.fieldEquals("Approval", id, "approved", aliceAddress.toHex());
      assert.fieldEquals("Approval", id, "tokenId", tokenId.toString());
      assert.fieldEquals("Approval", id, "owner", owner.id.toHex());
      assert.fieldEquals("Approval", id, "token", token.id.toHex());
    });

    test("should throw error if owner not exists", function() {});

    test("should throw error if token not exists", function() {});
  });

  describe("handleApprovalForAll", function() {
    test("should create a new ApprovalForAll entity", function() {});

    test("should throw error if owner not exists", function() {});
  });

  describe("handleTransfer", function() {
    test("should create a new Transfer entity", function() {});

    test("should create a new Token entity", function() {});

    test("should create a new Owner entity", function() {});
  });
});
