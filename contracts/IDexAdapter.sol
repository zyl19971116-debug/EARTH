// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; interface IDexAdapter{function createPool(address token,address quote)external returns(address);function addLiquidity(address token,address quote,uint256 tokenAmount,uint256 quoteAmount)external returns(uint256);function getPoolAddress(address token,address quote)external view returns(address);}
