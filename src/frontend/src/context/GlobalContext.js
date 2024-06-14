import React, { createContext, useContext, useState } from 'react';
import Web3 from 'web3';

const GlobalContext = createContext();

const projectId = 'aaa';
const projectSecretKey = 'projectaaa_secret_key';
const authorization = 'Basic ' + btoa(projectId + ':' + projectSecretKey);

const dataTokenAbi = require('../abi/DataToken.json')['abi'];
const dataTokenBytecode = require('../abi/DataToken.json')['bytecode'][
  'object'
];
// const dataTokenContractAddress = '0x5a6012139EEad9207B780944a55877AF8d8CDb5D';
// const dataTokenContractAddress = '0xd5035CaBe7fA58867AEEf98c596C9e529781A313';
const dataTokenContractAddress = '0xcB132184aBb4790AE2f5ec7E8e2B21037F17dE1A';

const web3 = new Web3('http://127.0.0.1:7545');
const contractCode = web3.eth.getCode(dataTokenContractAddress);
if (contractCode === '0x') {
  console.log('Contract not deployed');
} else {
  console.log('Contract deployed');
}

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
          from: userAddress,
          gas: 3000000,
        });

      const mintedEvent = result.events.Minted;
      if (mintedEvent && mintedEvent.returnValues) {
        const tokenId = mintedEvent.returnValues.nftId;
        setIpfsUrls((prevIpfsUrls) => [
          ...prevIpfsUrls,
          { tokenUri: ipfsHash, tokenId },
        ]);
        prefetchImages([...ipfsUrls, { tokenUri: ipfsHash, tokenId }]);

        return Number(tokenId);
      } else {
        console.error('Minted event not found in transaction receipt');
        return null;
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  };

  const getDataFromToken = async (tokenId, userAddress) => {
    try {
      const result = await dataTokenContract.methods
        .getDataItemForToken(tokenId, userAddress)
        .call({ from: userAddress });

      return result.dataIpfsURL;
    } catch (error) {
      console.error('Error getting data from token:', error);
    }
  };

  const getDataFromTokensForAccount = async (account) => {
    try {
      const totalTokens = await dataTokenContract.methods
        .numberOfTokens()
        .call();

      const ipfsUrlsAndIds = [];

      for (let tokenId = 1; tokenId <= Number(totalTokens); tokenId++) {
        try {
          const tokenUri = await dataTokenContract.methods
            .tokenURI(tokenId)
            .call({ from: account });
          ipfsUrlsAndIds.push({ tokenUri, tokenId });
        } catch (error) {
          continue;
        }
      }

      return ipfsUrlsAndIds;
    } catch (error) {
      console.error('Error getting data from tokens for account:', error);
    }
  };

  const generatePlaceholderImage = (url) => {
    if (!url) return '';
    console.log('Generating placeholder image for:', url);
    const hash = url
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = `#${((hash & 0xffffff) << 0).toString(16).padStart(6, '0')}`;
    return `https://via.placeholder.com/200/${color.substr(
      1
    )}/FFFFFF?text=Your+NFT`;
  };

  const prefetchImages = (urlsAndIds) => {
    urlsAndIds.forEach((urlAndId) => {
      const url = urlAndId.tokenUri;

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
    if (!account) {
      setIpfsUrls([]);
      setImages({});
      return;
    }
    const urlsAndIds = await getDataFromTokensForAccount(account);

    setIpfsUrls(urlsAndIds);

    const urls = urlsAndIds.map((urlAndId) => urlAndId.tokenUri);
    prefetchImages(urls);
  };

  const deployNewContract = async (userAddress) => {
    try {
      const contract = new web3.eth.Contract(dataTokenAbi);
      contract.options.data = dataTokenBytecode;
      const deployTx = contract.deploy({ arguments: [userAddress] });
      const deployedContract = await deployTx
        .send({
          from: userAddress,
          gas: 1000000,
        })
        .once('transactionHash', (txHash) => {
          console.log('Creating contract with txHash: ', txHash);
        });
      console.log(`Contract deployed at ${deployedContract.options.address}`);

      return deployedContract.options.address;
    } catch (error) {
      console.error('Error deploying new contract:', error);
    }
  };

  const transferTokenOwnership = async (newOwner, tokenIds, userAddress) => {
    try {
      console.log(
        'Transferring token ownership:',
        newOwner,
        tokenIds,
        userAddress
      );
      const result = await dataTokenContract.methods
        .transferTokenOwnership(newOwner, tokenIds)
        .send({ from: userAddress });

      const mintedEvent = result.events.TokenOwnershipTransfered;
      console.log('Minted event', mintedEvent);
      if (mintedEvent && mintedEvent.returnValues) {
        fetchData(userAddress);
      }
    } catch (error) {
      console.error('Error transferring token ownership:', error);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        sendDataToIpfs,
        mintDataToken,
        getDataFromToken,
        getDataFromTokensForAccount,
        transferTokenOwnership,
        ipfsUrls,
        images,
        fetchData,
        generatePlaceholderImage,
        deployNewContract,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
