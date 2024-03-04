// SPDX-License-Identifier: MIT

pragma solidity =0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title Finay
 * @dev ERC-1155 based NFT contract with URI storage and royalty support.
 */
contract Finay is Initializable,
    ERC1155URIStorageUpgradeable,
    ERC2981Upgradeable,
    ReentrancyGuardUpgradeable{
      // Custom constructor to allow upgrades, use with caution
    /// @custom:oz-upgrades-unsafe-allow constructor

    address public  superAdmin;   // The admin address
    address public  marketplace;   // The marketplace contract address
    string private _uri;     // Base URI for token metadata


     mapping(address=> bool) public isSubAdmin;    // Mapping to track admin status for addresses
     mapping(uint256 => uint256) public tokenMinted;    // Mapping to track the number of tokens minted

     error invalidCaller(address _caller, address _validCaller );
     error notSuperAdmin(address _caller, address _superAdmin);
     error notSubAdmin(address _caller, bool _isAdmin);

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

    event LazyMint(uint256 _tokenId, uint256 _amount, address _buyer);

  // Initialize the contract with necessary parameters
    /**
     * @dev Initializes the Finay contract.
     * @param __uri The base URI for token metadata.
     * @param _marketplace The address of the associated marketplace contract.
     * @param _admin The initial admin address.
     */   

    function initialize(
        string memory __uri,
        address _marketplace,
        address _admin
         ) initializer public {
        __ERC1155_init(__uri);
        __ERC2981_init_unchained();
          // address_admin,
          marketplace = _marketplace;
          superAdmin = _admin;
          isSubAdmin[_admin] = true;
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


 // Mint new tokens and assign them to a user
    /**
     * @dev Mints new tokens and assigns them to a user.
     * @param recipient The address to receive the minted tokens.
     * @param id The ID of the token to be minted.
     * @param amount The amount of tokens to be minted.
     * @param data Additional data to be included in the mint transaction.
     */
        function safeMint(
        address recipient,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlySuperAdmin {
        tokenMinted[id] += amount;
        _mint(recipient, id, amount, data);
    }

// Mint tokens for a seller and set royalty fee and token URI
    /**
     * @dev Mints tokens for a seller, sets royalty fee and token URI.
     * @param _tokenId The ID of the token to be minted.
     * @param _amount The amount of tokens to be minted.
     * @param _seller The address of the token seller.
     * @param _buyer The address of the token buyer.
     * @param _royaltyfee The royalty fee percentage.
     * @param _tokenuri The URI for the minted token.
     */
    function lazyMint(
        uint256 _tokenId,
        uint256 _amount,
        address _seller,
        address _buyer,
        uint96 _royaltyfee,
        string memory _tokenuri
    ) public nonReentrant {
        // require(msg.sender == marketplace || msg.sender == superAdmin, "IC"); //INVALID CALLER

        if(msg.sender != marketplace && msg.sender != superAdmin) {
            revert invalidCaller({
                _caller: msg.sender,
                _validCaller: marketplace
            });
        }

        _mint(_seller, _tokenId, _amount, "");

        _setTokenRoyalty(_tokenId, _seller, _royaltyfee);

        _setURI(_tokenId, _tokenuri);

        _setApprovalForAll(_seller, marketplace, true);

        tokenMinted[_tokenId] += _amount;

        _safeTransferFrom(_seller, _buyer, _tokenId, _amount, "");

        _setApprovalForAll(_buyer, marketplace, true);

        emit LazyMint(_tokenId,_amount,_buyer);

    }


// Get royalty information for a token
    /**
     * @dev Retrieves royalty information for a token.
     * @param tokenId The ID of the token.
     * @param salePrice The sale price of the token.
     * @return The address of the royalty receiver and the calculated royalty amount.
     */
        

    /**
     * @dev Overrides the function to provide the token URI.
     * @return The URI of the token.
     */
    function uri(uint256) public view virtual override(
        ERC1155URIStorageUpgradeable
        ) returns (string memory) {
        return _uri;
    }

// Override to support specific interfaces
    /**
     * @dev Overrides the function to support specific interfaces.
     * @param interfaceId The ID of the interface.
     * @return Whether the contract supports the specified interface.
     */    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC2981Upgradeable, ERC1155Upgradeable)
        returns (bool)
    {
         
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function updateMarketplace(address _newMarketplace) external onlySuperAdmin{
        marketplace = _newMarketplace;
    }
}
