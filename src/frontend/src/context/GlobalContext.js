import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import nftPlaceholder from '../img/new-logo-nobg.png';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [ipfsUrls, setIpfsUrls] = useState([]);
  const [images, setImages] = useState({});

  const [dataItems, setDataItems] = useState([]);

  const { web3, dataTokenContract, dataTokenAbi, dataTokenBytecode } =
    useAuth();

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

  const mintDataToken = async (owner, ipfsHash, userAddress) => {
    try {
      const result = await dataTokenContract.methods
        .mintDataToken(owner, ipfsHash)
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
      const tokenDatas = await dataTokenContract.methods
        .getDataItemsForOwner(account)
        .call({ from: account });

      return tokenDatas;
    } catch (error) {
      console.error('Error getting data from tokens for account:', error);
      return [];
    }
  };

  const generatePlaceholderImage = async (url) => {
    if (!url) return '';

    const fullUrl = `https://moccasin-just-wasp-741.mypinata.cloud/ipfs/${url}`;
    const placeholderUrl = nftPlaceholder;

    const checkedImg = await checkImage(fullUrl)
      .then(() => fullUrl)
      .catch(() => placeholderUrl);

    return checkedImg;
  };

  const checkImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => reject();
    });
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

  const getDoctorDataItems = async (account) => {
    try {
      const newDataItems = await dataTokenContract.methods
        .getDataItemsForDoctor()
        .call({ from: account });
      const tokenIds = newDataItems.map((item) => Number(item.dataTokenId));
      const owners = await dataTokenContract.methods
        .getOwnersForTokenIds(tokenIds)
        .call({ from: account });

      const newDataItemsWithOwners = newDataItems.map((item, index) => ({
        ...item,
        owner: owners[index],
      }));

      setDataItems(newDataItemsWithOwners);
    } catch (error) {
      console.error('Error getting data items for doctor:', error);
    }
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
        getDoctorDataItems,
        dataItems,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
