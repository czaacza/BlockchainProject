import Web3 from 'web3';
import React, { useEffect } from 'react';
import { useContext } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const BLOCKCHAIN_URL = 'http://127.0.0.1:8545';
  const web3 = new Web3(BLOCKCHAIN_URL);
  const dataTokenContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const dataTokenAbi = require('../abi/DataToken.json')['abi'];
  const dataTokenBytecode = require('../abi/DataToken.json')['bytecode'];
  const dataTokenContract = new web3.eth.Contract(
    dataTokenAbi,
    dataTokenContractAddress
  );

  const { address } = useAccount();
  const [isDoctor, setIsDoctor] = React.useState(false);

  const { connect } = useConnect({
    connector: new MetaMaskConnector({
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
  });

  const { disconnect } = useDisconnect();

  useEffect(() => {
    fetchDoctorStatus();
  }, []);

  const login = async () => {
    console.log('login');
    fetchDoctorStatus();
    await connect();
  };

  const logout = async () => {
    console.log('logout');
    fetchDoctorStatus();
    disconnect();
  };

  async function fetchDoctorStatus() {
    const doctorAddress = await dataTokenContract.methods.getDoctor().call();
    setIsDoctor(doctorAddress === address);
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        BLOCKCHAIN_URL: BLOCKCHAIN_URL,
        web3,
        dataTokenAbi,
        dataTokenBytecode,
        dataTokenContract,
        isDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
