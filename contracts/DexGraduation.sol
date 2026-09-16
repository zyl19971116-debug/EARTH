// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; import "./IDexAdapter.sol";
contract DexGraduation{IDexAdapter public adapter;address public owner;mapping(address=>address)public pools;constructor(address a){owner=msg.sender;adapter=IDexAdapter(a);}function graduate(address token,address quote,uint256 tokenAmount,uint256 quoteAmount)external returns(address pool){require(msg.sender==owner,"owner");pool=adapter.getPoolAddress(token,quote);if(pool==address(0))pool=adapter.createPool(token,quote);adapter.addLiquidity(token,quote,tokenAmount,quoteAmount);pools[token]=pool;}}
