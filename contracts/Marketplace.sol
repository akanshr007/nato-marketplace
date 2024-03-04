// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "contracts/interfaces/IFinayNFT.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Relayer/BasicMetaTransaction.sol";

/**
 * @title MarketPlace
 * @dev A decentralized marketplace contract for buying NFTs, supporting both primary and secondary market transactions.
 */
contract MarketPlace is  Initializable,BasicMetaTransaction {

    address public superAdmin;  // The admin address

    address usdc;   // Address for the USDC token

    address NFT;    // Address for the NFT contract

    error notSuperAdmin(address _caller, address _superAdmin);
    error notSubAdmin(address _caller, bool _isAdmin);
    error zeroAddress();
    error zeroAmount();
    error unmatchedLength();

    modifier onlySuperAdmin() {
        // require(_msgSender()==superAdmin,"Not the admin.");
        if(msg.sender != superAdmin){
            revert notSuperAdmin({
                _caller: msg.sender,
                _superAdmin: superAdmin
            });
        }
        _;
    }

    modifier checkSubAdmin() {
        // require(isSubAdmin[_msgSender()],"Not subAdmin.");
        if(!isSubAdmin[_msgSender()]){
            revert notSubAdmin({
                _caller: msg.sender,
                _isAdmin: false
            });
        }
        _;
    }

    // Mapping for used Listing vouchers
    mapping(uint256 => bool) public usedListingCounters;
    // Mapping of the counter to the amount left in voucher
    mapping(uint256 => uint256) public amountLeft;

    mapping(address=> bool) public isSubAdmin;

    bytes4 private constant FUNC_Selector =
    bytes4(keccak256("royaltyInfo(uint256,uint256)"));

    event BuyBatchNFT(uint256[] _tokenIds, uint256[] _amounts, address _buyer);

      // Initialize the contract with necessary parameters
    /**
     * @dev Initializes the MarketPlace contract.
     * @param _NFT The address of the NFT contract.
     * @param _admin The initial admin address.
     */
    
    function initialize(address _NFT, address _admin) public  initializer {
        superAdmin = _admin;
        isSubAdmin[_admin] = true;
        NFT = _NFT;
    }

   // Admin-related functions to manage admin status

    /**
     * @dev Assigns admin status to a given address.
     * @param _admin The address to be assigned admin status.
     */

    function assignAdmin(address _admin) external onlySuperAdmin{
        isSubAdmin[_admin]=true;
    }

 /**
     * @dev Removes admin status from a given address.
     * @param _admin The address to be removed from admin status.
     */

    function removeAdmin(address _admin) external onlySuperAdmin{
        isSubAdmin[_admin] =false;
    }

  /**
     * @dev Updates the admin address.
     * @param _admin The new admin address.
     */
    function updateAdmin(address _admin) external onlySuperAdmin {
        superAdmin = _admin;
    }

// Buy NFT function for the marketplace
    /**
     * @dev Handles the purchase of a single NFT.
     * @param _seller The address of the NFT seller.
     * @param _royaltyKeeper The address to receive royalty fees.
     * @param _buyer The address of the NFT buyer.
     * @param _tokenId The ID of the NFT.
     * @param _amount The amount of NFT tokens to buy.
     * @param _royaltyFee The royalty fee percentage.
     * @param _tokenURI The URI of the NFT token.
     * @param _isPrimary Flag indicating if it's a primary market transaction.
     */    
    function buyNFT(address _seller, 
        address _royaltyKeeper, 
        address _buyer,
        uint256 _tokenId, 
        uint256 _amount, 
        uint96 _royaltyFee,
        string memory _tokenURI,
        bool _isPrimary) public checkSubAdmin {
            // require(_seller!=address(0),"Zero address.");
            // require(_buyer!=address(0),"Zero address.");
            // require(_royaltyKeeper!=address(0),"Zero address.");
            if(_seller==address(0) || _buyer==address(0) || _royaltyKeeper==address(0)){
                revert zeroAddress();
            }
            // require(_amount>0,"Zero amount.");
            // require(_tokenId>0,"Zero Token Id");
            // require(_royaltyFee>0,"Zero royaltyfee");
            if(_amount==0 || _tokenId==0 || _royaltyFee==0) {
                revert zeroAmount();

            }
            if(_isPrimary) {
            IFinayNFT(NFT).lazyMint(_tokenId, _amount, _seller, _buyer, _royaltyFee,_tokenURI);
            } else
             {
            // console.log("it is working till here") ;
            
            IERC1155Upgradeable(NFT).safeTransferFrom(_seller, _buyer, _tokenId, _amount, "");
            }
    }

 /**
     * @dev Handles the purchase of multiple NFTs in a batch.
     * @param _sellers The addresses of NFT sellers.
     * @param _royaltyKeepers The addresses to receive royalty fees.
     * @param _buyer The address of the NFT buyer.
     * @param _tokenIds The IDs of the NFTs.
     * @param _amounts The amounts of NFT tokens to buy.
     * @param _royaltyFees The royalty fee percentages.
     * @param _tokenURIs The URIs of the NFT tokens.
     * @param _isPrimary Flags indicating if it's a primary market transaction for each NFT.
     */
    function buyBatchNFT(address[] memory _sellers,
    address[] memory _royaltyKeepers,
    address _buyer,
    uint256[] memory _tokenIds,
    uint256[] memory _amounts,
    uint96[] memory  _royaltyFees,
    string[] memory _tokenURIs,
    bool[] memory _isPrimary
    ) external checkSubAdmin {
        // require(_sellers.length==_tokenIds.length && _sellers.length == _amounts.length , "ISAL" );// Ids,seller and Amount length should be equal
        // require(_amounts.length==_tokenURIs.length && _amounts.length==_royaltyFees.length,"AURL");

        if(_sellers.length!=_tokenIds.length || _sellers.length!=_amounts.length || _sellers.length!=_tokenURIs.length || _sellers.length!=_royaltyFees.length){
            revert unmatchedLength();
        }
        
        uint length = _tokenIds.length;
        for(uint i=0;i<length;i++) {
            buyNFT(_sellers[i],_royaltyKeepers[i],_buyer,_tokenIds[i],_amounts[i],_royaltyFees[i],_tokenURIs[i],_isPrimary[i]);
        }
        emit BuyBatchNFT(_tokenIds,_amounts,_buyer);
    }
    function _msgSender() internal virtual override(BasicMetaTransaction) view returns(address sender) {
        if(msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
            }
        } else {
            return msg.sender;
        }
    }
}
 