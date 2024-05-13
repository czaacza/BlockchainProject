import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import { useContext } from 'react';

const AuthContext = React.createContext();
const BLOCKCHAIN_URL = 'http://127.0.0.1:7545';
const AUTH_ABI = require('../abi/Auth.json')['abi'];

export function AuthProvider({ children }) {
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const web3 = new Web3(BLOCKCHAIN_URL);
    setWeb3(web3);
    console.log('web3', web3);
  }, []);

  const login = async (address, name, password) => {
    const authAddress = '0xe67325a49d99169cD4F348249E2CE41dc806B75c';
    const authContract = new web3.eth.Contract(AUTH_ABI, authAddress);
    try {
      const result = await authContract.methods
        .registerUser(address, name, password, '0x0', '0x0')
        .call();

      const loginResult = await authContract.methods
        .loginUser(address, password)
        .send({ from: address, gas: 3000000 });

      const isUserLogged = await authContract.methods
        .checkIsUserLogged(address)
        .call();

      console.log('loginResult', loginResult);
      console.log('isUserLogged', isUserLogged);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider value={{ login }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
