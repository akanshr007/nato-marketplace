// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;
    

library structs{
    
    struct makeOffer {
        uint256 offernumber;
        uint256 tokenId;
        address offerMaker;
        address offerAccepter;
        uint256 offerAmount;
        uint256 askedQuantity;
        bytes signature;
    }


}