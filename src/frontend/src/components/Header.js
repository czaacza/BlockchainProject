import React from 'react';
import Logo from '../moralis-logo.svg';
import Eth from '../eth.svg';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalContext } from '../context/GlobalContext';

function Header(props) {
  const { address, isConnected, connect, disconnect } = props;
  const { login } = useAuth();
  const { fetchData } = useGlobalContext();

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

  async function handleLogout() {
    disconnect();
    fetchData('');
  }

  return (
    <header>
      <div className="leftH">
        <Link to="/" className="link">
          <div className="headerItem">Strona główna</div>
        </Link>
        <Link to="/" className="link">
          <div className="headerItem">O projekcie</div>
        </Link>
        <Link to="/" className="link">
          <div className="headerItem">Kontakt</div>
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
            : 'Połącz konto'}
        </div>
        {isConnected && (
          <div className="connectButton" onClick={handleLogout}>
            Logout
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
