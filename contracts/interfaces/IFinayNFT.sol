//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.17;

interface IFinayNFT {

    function lazyMint(
        uint256 _tokenId,
        uint256 _amount,
        address _seller,
        address _buyer,
        uint96 _royaltyfee,
        string memory _tokenuri
    ) external;

struct primaryBuy {
        address nftAddress;
        address seller;
        address royaltyKeeper;
        uint256 amount;
        uint256 tokenId;
        uint256 pricePerShare;
        uint256 counter;
        uint96 royaltyFee;
        bool isPrimary;
        string tokenUri;
        bytes signature;
    }

}