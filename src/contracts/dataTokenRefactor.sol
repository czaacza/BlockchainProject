// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "../openzeppelin-contracts-4.8.0/contracts/access/Ownable.sol";

contract DataToken is Ownable {
    uint256 private numberOfTokens;
    address private _doctor;

    constructor(address doctorAddress) {
        _transferOwnership(msg.sender);
        _doctor = doctorAddress;
    }

    // Events
    event Minted(address indexed doctor, uint256 indexed tokenId);
    event TokenOwnershipTransferred(uint256 indexed tokenId, address indexed newOwner);
    event DoctorChanged(address indexed newDoctor);
    event ContractOwnershipTransferred(address indexed newOwner);

    struct DataItem {
        uint256 dataTokenId;
        string dataIpfsURL;
    }

    // Mapping of token ID to DataItem
    mapping(uint256 => DataItem) private _dataItems;
    // Mapping of token ID to owner address
    mapping(uint256 => address) private _tokenOwners;
    // Mapping of owner to their tokens
    mapping(address => uint256[]) private _ownerTokens;

    // Modifier to restrict function access to the doctor
    modifier onlyDoctor {
        require(msg.sender == _doctor, "Only the doctor can call this function");
        _;
    }

    // Mint new data token
    function mintDataToken(address tokenOwner, string memory ipfsDataURL) public onlyDoctor returns (uint256) {
        require(bytes(ipfsDataURL).length > 0, "IPFS URL is required");

        numberOfTokens++;
        uint256 tokenId = numberOfTokens;

        _dataItems[tokenId] = DataItem(tokenId, ipfsDataURL);
        _tokenOwners[tokenId] = tokenOwner;
        _ownerTokens[tokenOwner].push(tokenId);

        emit Minted(msg.sender, tokenId);
        return tokenId;
    }

    // Retrieve data for a specific token ID
    function getDataItem(uint256 tokenId) public view returns (DataItem memory) {
        require(_isTokenOwnerOrDoctor(tokenId), "Access restricted to token owner or doctor");
        return _dataItems[tokenId];
    }

    // Retrieve all data items owned by a specific owner
    function getDataItemsForOwner(address owner) public view returns (DataItem[] memory) {
        require(msg.sender == _doctor || msg.sender == owner, "Access restricted to owner or doctor");

        uint256[] storage ownedTokens = _ownerTokens[owner];
        DataItem[] memory items = new DataItem[](ownedTokens.length);

        for (uint256 i = 0; i < ownedTokens.length; i++) {
            items[i] = _dataItems[ownedTokens[i]];
        }
        return items;
    }

    // Retrieve all data items for doctor’s patients
    function getDataItemsForDoctor() public view onlyDoctor returns (DataItem[] memory) {
        DataItem[] memory items = new DataItem[](numberOfTokens);
        uint256 counter = 0;

        for (uint256 i = 1; i <= numberOfTokens; i++) {
            if (_tokenOwners[i] != address(0)) {
                items[counter] = _dataItems[i];
                counter++;
            }
        }
        return items;
    }

    function getOwnersForTokenIds(uint256[] memory tokenIds) public view onlyDoctor returns (address[] memory) {
        address[] memory owners = new address[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            owners[i] = _tokenOwners[tokenIds[i]];
        }
        return owners;
    }

    // Transfer ownership of a specific token to a new owner
    function transferTokenOwnership(uint256 tokenId, address newOwner) public {
        require(_isTokenOwnerOrDoctor(tokenId), "Access restricted to token owner or doctor");
        require(newOwner != address(0), "New owner cannot be the zero address");

        address currentOwner = _tokenOwners[tokenId];
        _tokenOwners[tokenId] = newOwner;

        _removeTokenFromOwnerEnumeration(currentOwner, tokenId);
        _ownerTokens[newOwner].push(tokenId);

        emit TokenOwnershipTransferred(tokenId, newOwner);
    }

    // Change doctor address (only current doctor can change)
    function changeDoctor(address newDoctor) public onlyDoctor {
        _doctor = newDoctor;
        emit DoctorChanged(newDoctor);
    }

    // Override transferOwnership to include event emission
    function transferOwnership(address newOwner) public override onlyOwner {
        _transferOwnership(newOwner);
        emit ContractOwnershipTransferred(newOwner);
    }

    // Helper functions

    // Checks if the caller is the token owner or doctor
    function _isTokenOwnerOrDoctor(uint256 tokenId) internal view returns (bool) {
        return (msg.sender == _doctor || msg.sender == _tokenOwners[tokenId]);
    }

    // Removes token from the list of tokens for a given owner
    function _removeTokenFromOwnerEnumeration(address owner, uint256 tokenId) private {
        uint256[] storage ownerTokens = _ownerTokens[owner];
        for (uint256 i = 0; i < ownerTokens.length; i++) {
            if (ownerTokens[i] == tokenId) {
                ownerTokens[i] = ownerTokens[ownerTokens.length - 1];
                ownerTokens.pop();
                break;
            }
        }
    }

    // Get doctor address
    function getDoctor() public view returns (address) {
        return _doctor;
    }
}
