import './App.css';
import Header from './components/Header';
import Tokens from './components/Tokens';
import { Routes, Route } from 'react-router-dom';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { AuthProvider } from './context/AuthContext';
import MintNFT from './components/MintNFT/MintNFT';
import { GlobalProvider } from './context/GlobalContext';

function App() {
  const isConnected = false;
  const address = '0x2df9DBfc76ce6E4FAC174a849Bcda0186F7167cE';
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
                  <MintNFT isConnected={isConnected} address={address} />
                }
              />
              <Route path="/tokens" element={<Tokens />} />
            </Routes>
          </div>
        </div>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
