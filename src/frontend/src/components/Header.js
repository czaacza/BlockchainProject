import React from 'react';
import Eth from '../eth.svg';
import { Link } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';

function Header(props) {
  const { address, isConnected } = props;
  const { fetchData } = useGlobalContext();
  const { login, logout } = useAuth();

  async function handleConnect() {
    if (!isConnected) {
      await login();
    } else {
      logout();
    }
  }

  async function handleLogout() {
    logout();
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
