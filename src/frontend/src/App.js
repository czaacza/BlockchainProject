import './App.css';
import Header from './components/Header';
import Tokens from './components/Tokens';
import { Routes, Route } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { AuthProvider } from './context/AuthContext';
import MintNFT from './components/MintNFT/MintNFT';
import { GlobalProvider } from './context/GlobalContext';
import Footer from './components/Footer/Footer';

function App() {
  const { address, isConnected } = useAccount();
  console.log('Account address:', address);

  return (
    <AuthProvider>
      <GlobalProvider>
        <div className="App">
          <Header isConnected={isConnected} address={address} />
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
          <Footer />
        </div>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
