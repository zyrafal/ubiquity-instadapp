// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

import {TokenInterface} from "../../common/interfaces.sol";

interface IUbiquityBondingV2 {
    struct Bond {
        address minter;
        uint256 lpFirstDeposited;
        uint256 creationBlock;
        uint256 lpRewardDebt;
        uint256 endBlock;
        uint256 lpAmount;
    }

    function deposit(uint256 lpAmount, uint256 durationWeeks) external returns (uint256 bondingShareId);

    function getBond(uint256 bondId) external returns (Bond memory bond);
}

interface IUbiquityMetaPool {
    function add_liquidity(uint256[2] memory _amounts, uint256 _min_mint_amount) external returns (uint256);
}

interface IUbiquity3Pool {
    function add_liquidity(uint256[3] calldata _amounts, uint256 _min_mint_amount) external;
}

interface IUbiquityAlgorithmicDollarManager {
    function dollarTokenAddress() external returns (address);

    function stableSwapMetaPoolAddress() external returns (address);

    function bondingContractAddress() external returns (address);
}
