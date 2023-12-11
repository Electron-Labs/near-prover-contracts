### NearProver

# On-Chain ZK Light Clients

For enhancing the security of this model, the light client can be maintained on-chain for the header syncing and inclusion proof verification.

NEAR has a ZK Light client (built by Electron) that enables the same. Let's look into that.

## ZK Light Client

Light Clients work by tracking the consensus which requires checking validator signatures. However, with NEAR having more than 100 validators, operating a NEAR Light client would require verifying 40+ Ed25519 signatures (for 67% voting power) on Ethereum, which would be prohibitively gas expensive. This is where the ZK Light Client tech by Electron comes in. We can generate ZK-proofs of validity of NEAR light consensus and submit these proofs on-chain instead. This will result in verification gas cost which is several orders of magnitude cheaper than direct on-chain clients.

## System Architecture using ZK Light Client

<figure><img src=".gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

Note the changes compared to the System Architecture diagram from the home page. The fisherman is no longer required, and the off-chain light client is replaced with on-chain ZK light client.

In the off-chain light client model, the rollup sequencer was responsible for informing rollup contract that the data had indeed been published on NEAR. It did so by checking NEAR consensus (using NEAR light client) at sequencer level. However, this meant that the sequencer could fake-inform the contracts about the data inclusion.

In this on-chain ZK light client model, the NEAR ZK Light Client is deployed on Ethereum mainnet directly. This means, the rollup contracts on Ethereum can now check the inclusion proofs directly on Ethereum, that removing the need to trust the rollup sequencer.

This transfers the security assumptions from rollup sequencer to NEAR consensus.

## Integrating the ZK Light Client

As part of Electron ZK-bridge , the NEAR ZK Light Client is already deployed on mainnet beta (pending audits). Regular light headers are also sent to keep the on-chain ZK Light Client in sync with NEAR consensus (per epoch as required by NEAR consensus).

Hence, in order to check for data inclusion proofs, one can -

1. Fetch `latest_height` from the Electron’s ZK light client contract.

```jsx
let nearBridge = await hre.ethers.getContractAt("INearBridge", "0x8Ef3bda91618572B90DC5EDC17CF700C5EA173aB")
let latest_height = parseInt((await nearBridge.bridgeState()).currentHeight)
```

2. Using the `receipt_id` , `receiver_id` and `latest_height` fetch the receipt inclusion proof from Near RPC.

```jsx
let receiptProof = await getLightClientProof(near, nearArchival, curHeight, receiptId, receiverId)
```

3. Borshify and send the receipt inclusion proof to near prover contract on Ethereum

```jsx
let nearProver = await hre.ethers.getContractAt("NearProver", "0x20D83b0bf8e4c3CddcB7106be96F28f1Aff4d551")
const outcome = await nearProver.proveOutcome(borshifyOutcomeProof(receiptProof), curHeight)
assert(outcome == true, "couldn't verify proof!")
```



This repo contains the implementation of function used above and the contract interfaces for anyone to verify their Near DA receipt ids with our Ethereum zk light client contracts on testnet.

{% embed url="https://github.com/Electron-Labs/near-prover-contracts" %}

You can also use this script directly to run and verify a receipt Id on chain on testnet.

{% embed url="https://github.com/Electron-Labs/near-prover-contracts/blob/master/scripts/prove.js" %}


#### Test `proveOutcome`
- `npx hardhat run scripts/prove.js --network goerli`

#### Test `proveOutcome`
- `npx hardhat node`
- `npx hardhat test --network localhost`

This codebase is a fork of the [Rainbow Bridge](https://github.com/aurora-is-near/rainbow-bridge).
