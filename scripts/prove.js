const hre = require("hardhat")
const nearAPI = require('near-api-js');
const { keyStores, connect } = require('near-api-js');
const assert = require('assert');
const { borshifyOutcomeProof } = require("../utils/borsh")

const homedir = require("os").homedir();
const credentials_dir = ".near-credentials";
const currentCredentialsPath = require('path').join(homedir, credentials_dir);

async function createConnection(networkId, nodeUrl, credentialsPath) {
  let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
  let config = {
    keyStore,
    networkId: networkId,
    nodeUrl: nodeUrl
  }
  let near_connection = await connect(config);
  return near_connection;
}

const getLightClientProof = async (near, nearArchival, lightBlockHeight, txReceiptId, receiverId) => {
  const block = await near.connection.provider.block({ blockId: lightBlockHeight })
  let proof
  try {
    proof = await near.connection.provider.sendJsonRpc(
      'light_client_proof', {
      type: 'receipt',
      receipt_id: txReceiptId,
      receiver_id: receiverId,
      light_client_head: block.header.hash
    }
    );
  } catch {
    proof = await nearArchival.connection.provider.sendJsonRpc(
      'light_client_proof', {
      type: 'receipt',
      receipt_id: txReceiptId,
      receiver_id: receiverId,
      light_client_head: block.header.hash
    }
    );
  }
  return proof
}

async function getTxData(near, nearArchival, txHash, accountId) {
  let decodedTxHash = nearAPI.utils.serialize.base_decode(txHash);
  let txData;
  try {
    txData = await near.connection.provider.txStatus(
      decodedTxHash,
      accountId
    );
  } catch {
    txData = await nearArchival.connection.provider.txStatus(
      decodedTxHash,
      accountId
    );
  }
  return txData;
}

const main = async () => {
  const nearArchival = await createConnection("testnet", "https://archival-rpc.testnet.near.org", currentCredentialsPath)
  const near = await createConnection("testnet", "https://rpc.testnet.near.org", currentCredentialsPath)

  let nearBridge = await hre.ethers.getContractAt("INearBridge", "0x8Ef3bda91618572B90DC5EDC17CF700C5EA173aB")
  let nearProver = await hre.ethers.getContractAt("NearProver", "0x20D83b0bf8e4c3CddcB7106be96F28f1Aff4d551")

  let accountId = "zkbridge.admin_electronlabs.testnet"

  // select some transaction hash
  let txHash = "BTvWjsCQJqPzYa3CYCvEfSJL3Y8AhYEgXeoJL7jwMXMg"
  let txBlockHeight = 147483460

  let curHeight = parseInt((await nearBridge.bridgeState()).currentHeight)
  assert(txBlockHeight <= curHeight, "tx block height must not exceed `curHeight`")

  let txData = await getTxData(near, nearArchival, txHash, accountId)

  // select some receiptId
  let receiptId = txData.transaction_outcome.outcome.receipt_ids[0]
  let receiverId = txData.transaction.receiver_id

  // getLightClientProof
  let receiptProof = await getLightClientProof(near, nearArchival, curHeight, receiptId, receiverId)
  const outcome = await nearProver.proveOutcome(borshifyOutcomeProof(receiptProof), curHeight)
  assert(outcome == true, "couldn't verify proof!")
}

if (require.main == module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}