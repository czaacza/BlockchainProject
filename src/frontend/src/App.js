import './App.css';
import Header from './components/Header';
import Swap from './components/Swap';
import Tokens from './components/Tokens';
import { Routes, Route } from 'react-router-dom';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { AuthProvider } from './context/AuthContext';

function App() {
  const { address, isConnected } = useAccount();
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
              element={<Swap isConnected={isConnected} address={address} />}
            />
            <Route path="/tokens" element={<Tokens />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
