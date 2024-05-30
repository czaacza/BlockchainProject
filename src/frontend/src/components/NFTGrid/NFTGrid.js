import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import './NFTGrid.css';

const NFTGrid = ({ account }) => {
  const { ipfsUrls, fetchData, images, generatePlaceholderImage } =
    useGlobalContext();

  useEffect(() => {
    fetchData(account);
  }, [account]);

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

  return (
    <div className="nft-grid-container">
      <h4 className="mb-5">Your Data NFTs</h4>
      <div className="nft-grid">
        {ipfsUrls.map((url, index) => (
          <div className="nft-item" key={index}>
            <div className="nft-image" onClick={() => openInNewTab(url)}>
              <img
                src={images[url] || generatePlaceholderImage(url)}
                alt={`Token ${index}`}
              />
            </div>
            <div className="nft-info">
              <h3>Token {index}</h3>
              <button
                type="button"
                className="text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                onClick={() => openInNewTab(url)}
              >
                View
              </button>
              <button
                type="button"
                className="text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                onClick={() => downloadFile(url)}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTGrid;
