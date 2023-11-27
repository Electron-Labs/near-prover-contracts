// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AdminControlled is Initializable {
    address public admin;
    address public nominatedAdmin;
    uint256 public paused;

    function initializeAdminControlled(address _admin, uint256 flags)
        public
        onlyInitializing
    {
        admin = _admin;
        paused = flags;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier pausable(uint256 flag) {
        require((paused & flag) == 0 || msg.sender == admin);
        _;
    }

    function adminPause(uint256 flags) public onlyAdmin {
        paused = flags;
    }

    function verifyAdminAddress(address newAdmin) internal view {
        require(
            newAdmin != admin,
            "Nominated admin is the same as the current"
        );
        // Zero address shouldn't be allowed as a security measure.
        // If it's needed to remove the admin consider using address with all "1" digits.
        require(
            newAdmin != address(0),
            "Nominated admin shouldn't be zero address"
        );
    }

    function nominateAdmin(address newAdmin) public onlyAdmin {
        verifyAdminAddress(newAdmin);
        nominatedAdmin = newAdmin;
    }

    function acceptAdmin() public {
        verifyAdminAddress(nominatedAdmin);
        // Only nominated admin could accept its admin rights
        require(
            msg.sender == nominatedAdmin,
            "Caller must be the nominated admin"
        );

        admin = nominatedAdmin;
        // Explicitly set not allowed zero address for `nominatedAdmin` so it's impossible to accidentally change
        // the admin if calling the function twice
        nominatedAdmin = address(0);
    }

    function rejectNominatedAdmin() public onlyAdmin {
        nominatedAdmin = address(0);
    }
}
