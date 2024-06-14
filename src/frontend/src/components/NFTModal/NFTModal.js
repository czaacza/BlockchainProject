import React, { useState } from 'react';
import './NFTModal.css';
import { useGlobalContext } from '../../context/GlobalContext';

const NFTModal = ({ isOpen, onClose, nft, ownerAddress }) => {
  const [newOwner, setNewOwner] = useState('');
  const { transferTokenOwnership } = useGlobalContext();

  if (!isOpen) return null;

  console.log('NFT MODAL NFT:', nft);

  const handleTransfer = async () => {
    try {
      const result = await transferTokenOwnership(
        newOwner,
        [nft.tokenId],
        ownerAddress
      );
      console.log(`Transfer NFT to: ${newOwner}`);
      console.log('Transfer NFT result:', result);
    } catch (error) {
      console.error('Error transferring NFT:', error);
    }
  };

  const downloadFile = (url) => {
    const fullUrl = `https://moccasin-just-wasp-741.mypinata.cloud/ipfs/${url}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.setAttribute('download', url);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-container"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(34,42,58)] p-6 rounded-lg shadow-lg relative flex max-w-4xl w-full nft-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex-1 pr-4 modal-left">
          <h2 className="text-2xl font-bold text-white">{nft.name}</h2>
          <p className="text-gray-300 mb-4">Owner: {ownerAddress}</p>
          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg text-black"
          />
          <button
            onClick={handleTransfer}
            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Transfer NFT
          </button>
        </div>
        <div className="flex-1 pl-4 modal-right">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-5/6 h-64 object-cover rounded-md"
          />
          <button
            type="button"
            className="text-white bg-gray-900 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 mt-3"
            onClick={() => downloadFile(nft.url)}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTModal;
