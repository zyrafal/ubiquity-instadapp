// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

/**
 * @title Ubiquity.
 * @dev Ubiquity Dollar (uAD).
 */

import {TokenInterface, MemoryInterface} from "../../common/interfaces.sol";
import {Stores} from "../../common/stores.sol";
import {SafeMath} from "../../common/math.sol";
import {IUbiquityBondingV2, IUbiquityMetaPool, IUbiquity3Pool, IUbiquityAlgorithmicDollarManager} from "./interfaces.sol";
import {Helpers} from "./helpers.sol";
import {Events} from "./events.sol";

contract ConnectV2Ubiquity is Helpers, Events {
    string public constant name = "Ubiquity-v1";

    /**
     * @dev Deposit into Ubiquity protocol
     * @notice 3POOL (DAI / USDC / USDT) => METAPOOL (3CRV / uAD) => uAD3CRV-f => Ubiquity BondingShare
     * @notice STEP 1 : 3POOL (DAI / USDC / USDT) => 3CRV
     * @notice STEP 2 : METAPOOL(3CRV / UAD) => uAD3CRV-f
     * @notice STEP 3 : uAD3CRV-f => Ubiquity BondingShare
     * @param token Token deposited : DAI, USDC, USDT, 3CRV, uAD or uAD3CRV-f
     * @param amount Amount of tokens to deposit (For max: `uint256(-1)`)
     * @param durationWeeks Duration in weeks tokens will be locked (4-208)
     * @param getId ID to retrieve amt.
     * @param setId ID stores the bonding share id of tokens deposited.
     */
    function deposit(
        address token,
        uint256 amount,
        uint256 durationWeeks,
        uint256 getId,
        uint256 setId
    ) external payable returns (string memory _eventName, bytes memory _eventParam) {
        address UAD = IUbiquityAlgorithmicDollarManager(UbiquityAlgorithmicDollarManager).dollarTokenAddress();
        address UAD3CRVf = IUbiquityAlgorithmicDollarManager(UbiquityAlgorithmicDollarManager)
            .stableSwapMetaPoolAddress();

        require(
            token == DAI || token == USDC || token == USDT || token == UAD || token == CRV3 || token == UAD3CRVf,
            "Invalid token: must be DAI, USDC, USDT, uAD, 3CRV or uAD3CRV-f"
        );

        uint256 _amount = getUint(getId, amount);
        uint256 lpAmount;

        // Full balance if amount = -1
        if (_amount == uint256(-1)) {
            _amount = getTokenBal(TokenInterface(token));
        }

        // STEP 1 : SwapTo3CRV : Deposit DAI, USDC or USDT into 3Pool to get 3Crv LPs
        if (token == DAI || token == USDC || token == USDT) {
            uint256[3] memory amounts1;

            if (token == DAI) amounts1[0] = _amount;
            else if (token == USDC) amounts1[1] = _amount;
            else if (token == USDT) amounts1[2] = _amount;

            approve(TokenInterface(token), Pool3, _amount);
            IUbiquity3Pool(Pool3).add_liquidity(amounts1, 0);
        }

        // STEP 2 : ProvideLiquidityToMetapool : Deposit in uAD3CRV pool to get uAD3CRV-f LPs
        if (token == DAI || token == USDC || token == USDT || token == UAD || token == CRV3) {
            uint256[2] memory amounts2;
            address token2 = token;
            uint256 _amount2;

            if (token == UAD) {
                _amount2 = _amount;
                amounts2[0] = _amount2;
            } else {
                if (token == CRV3) {
                    _amount2 = _amount;
                } else {
                    token2 = CRV3;
                    _amount2 = getTokenBal(TokenInterface(token2));
                }
                amounts2[1] = _amount2;
            }

            approve(TokenInterface(token2), UAD3CRVf, _amount2);
            lpAmount = IUbiquityMetaPool(UAD3CRVf).add_liquidity(amounts2, 0);
        }

        // STEP 3 : Farm/ApeIn : Deposit uAD3CRV-f LPs into UbiquityBondingV2 and get Ubiquity Bonding Shares
        if (token == UAD3CRVf) {
            lpAmount = _amount;
        }

        address Bonding = IUbiquityAlgorithmicDollarManager(UbiquityAlgorithmicDollarManager).bondingContractAddress();
        approve(TokenInterface(UAD3CRVf), Bonding, lpAmount);
        uint256 bondingShareId = IUbiquityBondingV2(Bonding).deposit(lpAmount, durationWeeks);

        setUint(setId, bondingShareId);

        _eventName = "Deposit(address,address,uint256,uint256,uint256,uint256,uint256,uint256)";
        _eventParam = abi.encode(address(this), token, amount, bondingShareId, lpAmount, durationWeeks, getId, setId);
    }

    /**
     * @dev Withdraw from Ubiquity protocol
     * @notice Ubiquity BondingShare => uAD3CRV-f => METAPOOL (3CRV / uAD) => 3POOL (DAI / USDC / USDT)
     * @notice STEP 1 : Ubiquity BondingShare  => uAD3CRV-f
     * @notice STEP 2 : uAD3CRV-f => METAPOOL(3CRV / UAD)
     * @notice STEP 3 : 3CRV => 3POOL (DAI / USDC / USDT)
     * @param bondingShareId Bonding Share Id to withdraw
     * @param token Token to withdraw to : DAI, USDC, USDT, 3CRV, uAD or uAD3CRV-f
     * @param getId ID
     * @param setId ID
     */
    function withdraw(
        uint256 bondingShareId,
        address token,
        uint256 getId,
        uint256 setId
    ) external payable returns (string memory _eventName, bytes memory _eventParam) {
        // address UAD = IUbiquityAlgorithmicDollarManager(UbiquityAlgorithmicDollarManager).dollarTokenAddress();
        // address UAD3CRVf = IUbiquityAlgorithmicDollarManager(UbiquityAlgorithmicDollarManager)
        //     .stableSwapMetaPoolAddress();
        // require(
        //     token == DAI || token == USDC || token == USDT || token == UAD || token == CRV3 || token == UAD3CRVf,
        //     "Invalid token: must be DAI, USDC, USDT, uAD, 3CRV or uAD3CRV-f"
        // );
        // uint256 _bondingShareId = getUint(getId, bondingShareId);
        // uint256 amount = 0;
        // // get bonding share
        // address Bonding = IUbiquityAlgorithmicDollarManager(UbiquityAlgorithmicDollarManager).bondingContractAddress();
        // IUbiquityBondingV2.Bond memory bond = IUbiquityBondingV2(Bonding).getBond(bondingShareId);
        // require(bond.minter == msg.sender, "Not owner of this Bonding Share");
        // // STEP 1 : Withdraw Ubiquity Bonding Shares to get back uAD3CRV-f LPs
        // // withdraw
        // // // STEP 2 : Withdraw uAD3CRV-f LPs to get back uAD or 3Crv
        // //    if (
        // //     token == DAI ||
        // //     token == USDC ||
        // //     token == USDT ||
        // //     token == UAD ||
        // //     token == CRV3
        // // ) {
        // //     uint256[2] memory amounts2;
        // //     address token2 = token;
        // //     uint256 _amount2;
        // //     if (token == UAD) {
        // //         _amount2 = _amount;
        // //         amounts2[0] = _amount2;
        // //     } else {
        // //         if (token == CRV3) {
        // //             _amount2 = _amount;
        // //         } else {
        // //             token2 = CRV3;
        // //             _amount2 = getTokenBal(TokenInterface(token2));
        // //         }
        // //         amounts2[1] = _amount2;
        // //     }
        // //     _lpAmount = IUbiquityMetaPool(UAD3CRVf).add_liquidity(amounts2, 0);
        // // }
        // // // STEP 3 : Withdraw  3Crv LPs from 3Pool to get back DAI, USDC or USDT
        // // if (token == DAI || token == USDC || token == USDT) {
        // //     uint256[3] memory amounts1;
        // //     if (token == DAI) amounts1[0] = _amount;
        // //     else if (token == USDC) amounts1[1] = _amount;
        // //     else if (token == USDT) amounts1[2] = _amount;
        // //     approve(TokenInterface(token), Pool3, _amount);
        // //     IUbiquity3Pool(Pool3).add_liquidity(amounts1, 0);
        // // }
        // setUint(setId, amount);
        // _eventName = "Withdraw(address,uint256,uint256,uint256,address,uint256,uint256,uint256)";
        // _eventParam = abi.encode(
        //     address(this),
        //     _bondingShareId,
        //     bond.lpAmount,
        //     bond.endBlock,
        //     token,
        //     amount,
        //     getId,
        //     setId
        // );
    }
}
