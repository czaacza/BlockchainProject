import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import NFTModal from '../NFTModal/NFTModal';
import './NFTGrid.css';

const NFTGrid = ({ address }) => {
  const { ipfsUrls, fetchData, images, generatePlaceholderImage } =
    useGlobalContext();
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    if (address) {
      fetchData(address);
    }
  }, [address]);

  const openInNewTab = (url) => {
    const fullUrl = `https://moccasin-just-wasp-741.mypinata.cloud/ipfs/${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
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

  const handleViewClick = (urlAndId, index) => {
    console.log('Handle view click', urlAndId, index);
    setSelectedNFT({
      name: `Token ${index}`,
      image:
        images[urlAndId.tokenUri] ||
        generatePlaceholderImage(urlAndId.tokenUri),
      owner: address,
      url: urlAndId.tokenUri,
      tokenId: urlAndId.tokenId,
    });
  };

  const closeModal = () => {
    setSelectedNFT(null);
  };

  console.log('ipfsUrls', ipfsUrls);

  return (
    <div className="nft-grid-container">
      <h4 className="mb-5">Your Data NFTs</h4>
      <div className="nft-grid">
        {ipfsUrls.map((url, index) => (
          <div className="nft-item" key={index}>
            <div
              className="nft-image"
              onClick={() => handleViewClick(url, index)}
            >
              <img
                src={
                  images[url.tokenUri] ||
                  (url.tokenUri && generatePlaceholderImage(url.tokenUri))
                }
                alt={`Token ${index}`}
              />
            </div>
            <div className="nft-info">
              <h3>Token {index}</h3>
              <button
                type="button"
                className="text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                onClick={() => handleViewClick(url, index)}
              >
                View
              </button>
              <button
                type="button"
                className="text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                onClick={() => downloadFile(url.tokenUri)}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedNFT && (
        <NFTModal
          isOpen={!!selectedNFT}
          onClose={closeModal}
          nft={selectedNFT}
          ownerAddress={address}
        />
      )}
    </div>
  );
};

export default NFTGrid;
