import React from 'react';
import Logo from '../moralis-logo.svg';
import Eth from '../eth.svg';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header(props) {
  const { address, isConnected, connect, disconnect } = props;
  const { login } = useAuth();

  async function handleConnect() {
    if (!isConnected) {
      await connect();
    } else {
      disconnect();
    }
  }
  async function handleLogin() {
    login(address, 'name', 'password');
  }

  return (
    <header>
      <div className="leftH">
        <Link to="/" className="link">
          <div className="headerItem">Home</div>
        </Link>
        <Link to="/tokens" className="link">
          <div className="headerItem">About the project</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src={Eth} alt="eth" className="eth" />
          Ethereum
        </div>
        <div className="connectButton" onClick={handleConnect}>
          {isConnected
            ? address.slice(0, 4) + '...' + address.slice(38)
            : 'Connect'}
        </div>
        {isConnected && (
          <div className="connectButton" onClick={handleLogin}>
            Login
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
