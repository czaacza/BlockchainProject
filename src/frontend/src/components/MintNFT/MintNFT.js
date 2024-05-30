import React, { useState } from 'react';
import { Input, message, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useGlobalContext } from '../../context/GlobalContext';
import { useAccount } from 'wagmi';
import NFTGrid from '../NFTGrid/NFTGrid';
import './MintNFT.css';

function MintNFT() {
  const [name, setName] = useState('');
  const [data, setData] = useState('');
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { address, isConnected } = useAccount();

  const {
    sendDataToIpfs,
    mintDataToken,
    getDataFromToken,
    getDataFromTokensForAccount,
  } = useGlobalContext();

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const onDataChange = (e) => {
    setData(e.target.value);
  };

  const onFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const mintNFT = async () => {
    messageApi.destroy();

    const formData = new FormData();
    const metadata = JSON.stringify({
      name: fileList[0].name,
      nftName: name,
      nftDescription: data,
    });
    const options = JSON.stringify({
      cidVersion: 0,
    });

    formData.append('file', fileList[0].originFileObj);
    formData.append('pinataMetadata', metadata);
    formData.append('pinataOptions', options);

    const ipfsHash = await sendDataToIpfs(formData);
    const tokenId = await mintDataToken(ipfsHash, address);

    messageApi.open({
      type: 'success',
      content: `NFT minted with tokenId=${tokenId}. Check your wallet!`,
      duration: 2.5,
    });

    const mintedNfts = await getDataFromTokensForAccount(
      '0x2df9DBfc76ce6E4FAC174a849Bcda0186F7167cE'
    );
  };

  return (
    <>
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
            placeholder="Your Name"
            value={name}
            onChange={onNameChange}
            className="mintNameInput"
            style={{
              fontSize: '16px',
              marginBottom: '10px',
              padding: '24px',
            }}
          />
          <Input.TextArea
            placeholder="Data to include in NFT"
            value={data}
            onChange={onDataChange}
            rows={4}
            style={{ fontSize: '16px', marginBottom: '10px' }}
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
            class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-2"
            onClick={mintNFT}
          >
            Mint your data NFT
          </button>
        </div>
        <NFTGrid account="0x2df9DBfc76ce6E4FAC174a849Bcda0186F7167cE" />
      </div>
    </>
  );
}

export default MintNFT;
