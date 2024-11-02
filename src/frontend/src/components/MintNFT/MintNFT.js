import React, { useState } from 'react';
import { Input, message, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGlobalContext } from '../../context/GlobalContext';
import NFTGrid from '../NFTGrid/NFTGrid';
import HeroSection from '../HeroSection/HeroSection';
import './MintNFT.css';
import { useAuth } from '../../context/AuthContext';
import NFTGridDoctor from '../NFTGrid/NFTGridDoctor';

function MintNFT({ address, isConnected }) {
  const [owner, setOwner] = useState('');
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { sendDataToIpfs, mintDataToken } = useGlobalContext();

  const onNameChange = (e) => {
    setOwner(e.target.value);
  };

  const onFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const { isDoctor } = useAuth();

  const mintNFT = async () => {
    messageApi.destroy();

    if (!fileList.length || !owner) {
      messageApi.open({
        type: 'warning',
        content:
          'Please provide a patient address and select a file to mint the NFT.',
        duration: 2.5,
      });
      return;
    }

    try {
      const formData = new FormData();
      const metadata = JSON.stringify({
        name: fileList[0].name,
        nftName: owner,
      });
      const options = JSON.stringify({
        cidVersion: 0,
      });

      formData.append('file', fileList[0].originFileObj);
      formData.append('pinataMetadata', metadata);
      formData.append('pinataOptions', options);

      const ipfsHash = await sendDataToIpfs(formData);
      console.log('IPFS Hash:', ipfsHash);
      const tokenId = await mintDataToken(owner, ipfsHash, address);
      console.log('Token ID:', tokenId);

      messageApi.open({
        type: 'success',
        content: `NFT minted with tokenId=${tokenId}. Check your wallet!`,
        duration: 2.5,
      });

      // Clear the input fields upon successful mint
      setOwner('');
      setFileList([]);
    } catch (error) {
      console.error('Minting error:', error);
      messageApi.open({
        type: 'error',
        content: 'An error occurred during minting. Please try again.',
        duration: 2.5,
      });
    }
  };

  if (!address) {
    return <HeroSection address={address} isConnected={isConnected} />;
  }

  return (
    <div className="mint-container">
      {contextHolder}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="mintForm" style={{ width: '100%' }}>
          <h4 className="mb-5">Mint Your Data NFT</h4>
          <Input
            placeholder="Patient's Address"
            value={owner}
            onChange={onNameChange}
            className="mintNameInput"
            style={{
              fontSize: '16px',
              marginBottom: '10px',
              padding: '24px',
            }}
          />
          <Upload
            fileList={fileList}
            beforeUpload={() => false} // Prevent automatic upload
            onChange={onFileChange}
            multiple={false}
          >
            <Button icon={<UploadOutlined />} style={{ marginBottom: '10px' }}>
              Select File
            </Button>
          </Upload>
          <button
            type="button"
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
            onClick={mintNFT}
          >
            Mint your data NFT
          </button>
        </div>
        {isDoctor ? (
          <NFTGridDoctor address={address} isDoctor />
        ) : (
          <NFTGrid address={address} />
        )}
      </div>
    </div>
  );
}

export default MintNFT;
