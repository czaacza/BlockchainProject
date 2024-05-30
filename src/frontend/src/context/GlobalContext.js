// globalContext.js

import React, { createContext, useContext, useState } from 'react';
import Web3 from 'web3';

const GlobalContext = createContext();

// If using authorization (e.g., with an external IPFS service like Infura), replace these with your credentials
const projectId = 'aaa'; // Replace with your actual project ID if using an external service
const projectSecretKey = 'projectaaa_secret_key'; // Replace with your actual project secret key if using an external service
const authorization = 'Basic ' + btoa(projectId + ':' + projectSecretKey);

const dataTokenAbi = require('../abi/DataToken.json')['abi'];
const dataTokenContractAddress = '0x5B86220e5e0f625fF9D6fA87e0BB893d1e39EC64';
const web3 = new Web3('http://127.0.0.1:7545');

const dataTokenContract = new web3.eth.Contract(
  dataTokenAbi,
  dataTokenContractAddress
);

export const GlobalProvider = ({ children }) => {
  const [ipfsUrls, setIpfsUrls] = useState([]);
  const [images, setImages] = useState({});

  const sendDataToIpfs = async (data) => {
    try {
      const res = await fetch(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5Y2M1MTRkMS1lNmMzLTQ1MzItYmIzMC0yNWNiMTEzMzRkYzUiLCJlbWFpbCI6Im1hdGljemFjemEuZmJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE3ODI5OWEzNTQwNjM2YmNkMTU1Iiwic2NvcGVkS2V5U2VjcmV0IjoiNGIyNjBjMzliMmQxZDhmNmE2Mjc0YjVmN2ZlMGYwMmNmZDU4MjUxYjlmM2Y3OTc3NDIxMmU5ZDc1YTA0MWQ2MiIsImlhdCI6MTcxNjY1Mzk5Mn0.k4YnoHF0jE74gDKkLJcgmelamMyQfHwcsqZV_6pBy5o`,
          },
          body: data,
        }
      );

      const resData = await res.json();
      console.log('resData', resData);
      return resData.IpfsHash;
    } catch (error) {
      console.error('Error adding file to IPFS:', error);
    }
  };

  const mintDataToken = async (ipfsHash, userAddress) => {
    try {
      const result = await dataTokenContract.methods
        .mintDataToken(ipfsHash)
        .send({
          from: '0x2df9DBfc76ce6E4FAC174a849Bcda0186F7167cE',
          gas: 3000000,
        });

      // Extract the tokenId from the Minted event
      const mintedEvent = result.events.Minted;
      if (mintedEvent && mintedEvent.returnValues) {
        const tokenId = mintedEvent.returnValues.nftId;
        console.log('Minted NFT with tokenId:', tokenId);

        // set the ipfsUrls and images state
        setIpfsUrls((prevIpfsUrls) => [...prevIpfsUrls, ipfsHash]);
        prefetchImages([...ipfsUrls, ipfsHash]);

        return Number(tokenId);
      } else {
        console.error('Minted event not found in transaction receipt');
        return null;
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  };

  const getDataFromToken = async (tokenId) => {
    try {
      const result = await dataTokenContract.methods
        .getDataItemForToken(tokenId)
        .call({ from: '0x2df9DBfc76ce6E4FAC174a849Bcda0186F7167cE' });

      console.log('Data from token:', result);

      return result.dataIpfsURL;
    } catch (error) {
      console.error('Error getting data from token:', error);
    }
  };

  const getDataFromTokensForAccount = async (account) => {
    try {
      // Get the total number of tokens minted
      const totalTokens = await dataTokenContract.methods
        .numberOfTokens()
        .call();

      console.log('Total tokens:', totalTokens);

      const ipfsUrls = [];

      for (let tokenId = 1; tokenId <= totalTokens; tokenId++) {
        const tokenURI = await dataTokenContract.methods
          .tokenURI(tokenId)
          .call({ from: account });
        ipfsUrls.push(tokenURI);
      }

      console.log('IPFS URLs for account:', ipfsUrls);
      return ipfsUrls;
    } catch (error) {
      console.error('Error getting data from tokens for account:', error);
    }
  };

  const generatePlaceholderImage = (url) => {
    const hash = url
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = `#${((hash & 0xffffff) << 0).toString(16).padStart(6, '0')}`;
    return `https://via.placeholder.com/200/${color.substr(
      1
    )}/FFFFFF?text=Your+NFT`;
  };

  const prefetchImages = (urls) => {
    urls.forEach((url) => {
      const img = new Image();
      const fullUrl = `https://moccasin-just-wasp-741.mypinata.cloud/ipfs/${url}`;
      img.src = fullUrl;

      img.onload = () => {
        setImages((prevImages) => ({ ...prevImages, [url]: fullUrl }));
      };

      img.onerror = () => {
        setImages((prevImages) => ({
          ...prevImages,
          [url]: generatePlaceholderImage(url),
        }));
      };
    });
  };

  const fetchData = async (account) => {
    const urls = await getDataFromTokensForAccount(account);
    setIpfsUrls(urls);
    prefetchImages(urls);
  };

  return (
    <GlobalContext.Provider
      value={{
        sendDataToIpfs,
        mintDataToken,
        getDataFromToken,
        getDataFromTokensForAccount,
        ipfsUrls,
        images,
        fetchData,
        generatePlaceholderImage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
