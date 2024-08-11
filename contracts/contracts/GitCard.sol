// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GiftCard is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;

    struct GitCardDetails {
        uint256 amount;
        address sender;
        address to;
    }

    mapping(uint256 => GitCardDetails) public giftCards;

    constructor(
        address initialOwner
    ) ERC721("GiftCard", "GC") Ownable(initialOwner) {}

    function createGiftCard(
        uint amount,
        address sender,
        address to,
        string memory uri
    ) public payable {
        require(amount > 0, "GiftCard: amount must be greater than 0");
        require(msg.value >= amount, "GiftCard: incorrect amount");

        // create a new NFT Id
        uint256 tokenId = _nextTokenId++;

        // store the gift card details
        giftCards[tokenId] = GitCardDetails(amount, sender, to);

        // mint the NFT
        _safeMint(to, tokenId);

        // Set the NFT URI data for type of gift card
        _setTokenURI(tokenId, uri);
    }

    function cancelGiftCard(uint tokenId) public {
        // check if the sender is the owner of the gift card
        require(
            ownerOf(tokenId) != address(0),
            "GiftCard: not eligible to cancel"
        );

        // get the gift card details
        GitCardDetails memory giftCard = giftCards[tokenId];

        // burn the NFT
        _burn(tokenId);

        // transfer the amount back to the sender
        payable(giftCard.sender).transfer(giftCard.amount);
    }

    function claimGiftCard(uint256 tokenId) public {
        // check if the sender is the owner of the gift card
        require(ownerOf(tokenId) == msg.sender, "GiftCard: not the owner");

        // get the gift card details
        GitCardDetails memory giftCard = giftCards[tokenId];

        // burn the NFT
        _burn(tokenId);

        // transfer the amount to the sender
        payable(giftCard.to).transfer(giftCard.amount);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
