import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/GlobalContext';
import NFTModal from '../NFTModal/NFTModal';
import './NFTGrid.css';
import { useAuth } from '../../context/AuthContext';

const NFTGridDoctor = ({ address }) => {
  const { dataItems, getDoctorDataItems, generatePlaceholderImage } =
    useGlobalContext();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [imageUrlMap, setImageUrlMap] = useState({});
  const [dataItemsByOwner, setDataItemsByOwner] = useState({});
  useEffect(() => {
    if (address) {
      getDoctorDataItems(address);
    }
  }, [address]);
  useEffect(() => {
    const loadImages = async () => {
      const urls = {};
      for (const item of dataItems) {
        urls[item.dataIpfsURL] = await generatePlaceholderImage(
          item.dataIpfsURL
        );
      }
      setImageUrlMap(urls);
    };
    const loadDataItemsByOwner = async () => {
      const dataItemsByOwner = {};
      for (const item of dataItems) {
        if (!dataItemsByOwner[item.owner]) {
          dataItemsByOwner[item.owner] = [];
        }
        dataItemsByOwner[item.owner].push(item);
      }
      setDataItemsByOwner(dataItemsByOwner);
    };

    loadImages();
    loadDataItemsByOwner();
  }, [dataItems, generatePlaceholderImage]);

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

  const handleViewClick = (dataItem, index) => {
    setSelectedNFT({
      name: `Token ${index}`,
      image: imageUrlMap[dataItem.dataIpfsURL] || '',
      owner: dataItem.owner,
      url: dataItem.dataIpfsURL,
      tokenId: dataItem.dataTokenId,
    });
  };

  const closeModal = () => {
    setSelectedNFT(null);
  };

  return (
    <div className="nft-grid-container">
      <h2 className="mb-5 subheading">Hello, Doctor</h2>
      <h4 className="mb-5">Your Patients NFTs</h4>
      <div className="nft-grid">
        {dataItems &&
          dataItems.map((dataItem, index) => (
            <div className="nft-item" key={index}>
              <div
                className="nft-image"
                onClick={() => handleViewClick(dataItem, index)}
              >
                <img
                  src={imageUrlMap[dataItem.dataIpfsURL] || ''}
                  alt={`Token ${index}`}
                />
              </div>
              <div className="nft-info">
                <h3>Token {index}</h3>
                <button
                  type="button"
                  className="text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                  onClick={() => handleViewClick(dataItem, index)}
                >
                  View
                </button>
                <button
                  type="button"
                  className="text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                  onClick={() => downloadFile(dataItem.dataIpfsURL)}
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
          ownerAddress={selectedNFT.owner}
        />
      )}
    </div>
  );
};

export default NFTGridDoctor;
