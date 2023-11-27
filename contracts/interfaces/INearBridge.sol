// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

interface INearBridge {
    event BlockHashAdded(uint64 indexed height, bytes32 blockHash);

    event BlockHashReverted(uint64 indexed height, bytes32 blockHash);

    struct BridgeState {
        uint256 currentHeight; // Height of the current confirmed block
    }

    function blockHashes(uint64 blockNumber) external view returns (bytes32);

    function blockMerkleRoots(
        uint64 blockNumber
    ) external view returns (bytes32);

    function balanceOf(address wallet) external view returns (uint256);

    function initWithValidators(bytes calldata initialValidators) external;

    function initWithBlock(bytes calldata data) external;

    function addLightClientBlock(
        bytes calldata data,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c
    ) external;

    function bridgeState() external view returns (BridgeState memory res);

    function getEpoch() external view returns (bytes32);
}
