import React from 'react';
import './HeroSection.css';
import nftExample from '../../img/new-logo-nobg.png';

function HeroSection({ address, isConnected, connect, disconnect }) {
  async function handleConnect() {
    if (!isConnected) {
      await connect();
    } else {
      disconnect();
    }
  }

  return (
    <section className="hero-container">
      <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-5 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
            Bezpieczny system wymiany danych
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
            Zaloguj się i przechowuj swoje dane bezpiecznie w zdecentralizowanym
            systemie opartym na Blockchainie Ethereum i technologii IPFS.
          </p>
          <p className="max-w-xl font-light text-gray-500 lg:mb-8 md:text-sm lg:text-md dark:text-gray-400">
            Projekt Dyplomowy, Autor: Mateusz Czarnecki
          </p>
          <button className="connectButton" onClick={handleConnect}>
            Połącz konto
            <svg
              className="w-5 h-5 ml-2 -mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex hero-image">
          <img src={nftExample} alt="mockup" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
