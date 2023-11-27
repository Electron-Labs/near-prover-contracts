const hre = require("hardhat")
const { expect } = require("chai")
const { borshifyOutcomeProof } = require("../utils/borsh")
const fs = require("fs");

const readReceiptProof = async () => {
  // *** `receiptProof` generated as follows***
  // let curHeight = 147483571 // current height on the lightclient
  // ensure transaction block <= curHeight
  // const block = await near.connection.provider.block({ blockId: curHeight })
  // let receiptProof = await near.connection.provider.sendJsonRpc(
  //   'light_client_proof', {
  //   type: 'receipt',
  //   receipt_id: "558ADEG4Fcpzs8cuw2J693NgowgxjgQxfPtaits15tKJ",
  //   receiver_id: "meta-v2.pool.testnet",
  //   light_client_head: block.header.hash
  // }
  // );
  const proof = JSON.parse(fs.readFileSync(`test/data/receiptProof.json`))
  return proof
}

describe("NearProver", function () {
  it("proveOutcome is true", async function () {
    let curHeight = 147483571
    let nearProver = await hre.ethers.getContractAt("NearProver", "0x20D83b0bf8e4c3CddcB7106be96F28f1Aff4d551")

    // read receipt proof
    let receiptProof = await readReceiptProof()
    const outcome = await nearProver.proveOutcome(borshifyOutcomeProof(receiptProof), curHeight)
    expect(outcome).equal(true)
  });
});
