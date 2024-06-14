import './App.css';
import Header from './components/Header';
import Tokens from './components/Tokens';
import { Routes, Route } from 'react-router-dom';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { AuthProvider } from './context/AuthContext';
import MintNFT from './components/MintNFT/MintNFT';
import { GlobalProvider } from './context/GlobalContext';
import { useEffect } from 'react';
import Footer from './components/Footer/Footer';

function App() {
  const { address, isConnected } = useAccount();

  console.log('App() Address:', address);

  const { connect } = useConnect({
    connector: new MetaMaskConnector({
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
  });
  const { disconnect } = useDisconnect();

  return (
    <AuthProvider>
      <GlobalProvider>
        <div className="App">
          <Header
            connect={connect}
            disconnect={disconnect}
            isConnected={isConnected}
            address={address}
          />
          <div className="mainWindow">
            <Routes>
              <Route
                path="/"
                element={
                  <MintNFT
                    isConnected={isConnected}
                    address={address}
                    connect={connect}
                    disconnect={disconnect}
                  />
                }
              />
              <Route path="/tokens" element={<Tokens />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
