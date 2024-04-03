window.addEventListener('load', async () => {
  // Checks if Web3 is available
  if (typeof Web3 !== 'undefined') {
    // Use the browser's Ethereum provider
    var web3 = new Web3(window.ethereum);

    try {
      // Request account access if needed
      await window.ethereum.enable();

      // Accounts now exposed, get the current block number
      web3.eth.getBlockNumber().then((result) => {
        document.getElementById('blockNumber').textContent = result;
      });
    } catch (error) {
      console.error(error);
    }
  } else {
    document.getElementById('blockNumber').textContent =
      'Web3 not found. Please install MetaMask.';
  }
});
