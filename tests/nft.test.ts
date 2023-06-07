import {
  afterEach,
  assert,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { handleOwnershipTransferred } from "../src/nft";
import { createAddress, createOwnershipTransferredEvent } from "./nft-utils";

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

      // Call handler
      handleOwnershipTransferred(event);

      // Check that entity was created
      assert.fieldEquals(
        "OwnershipTransferred",
        event.transaction.hash.concatI32(event.logIndex.toI32()).toString(),
        "previousOwner",
        bobAddress.toString()
      );
      assert.fieldEquals(
        "OwnershipTransferred",
        event.transaction.hash.concatI32(event.logIndex.toI32()).toString(),
        "newOwner",
        aliceAddress.toString()
      );
    });
  });

  describe("handleApproval", function() {
    test("should create a new Approval entity", function() {});

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
