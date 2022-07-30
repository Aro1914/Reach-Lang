import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { loadStdlib } from '@reach-sh/stdlib';

// We are going to use all of the different Wallets in this program...
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';
import { ALGO_WalletConnect as WalletConnect } from '@reach-sh/stdlib';

// This program is intended to be used on the Algorand TestNet.
const providerEnv = 'TestNet';

// We're going to modify this global variable a lot...
let stdlib = undefined;

function renderDOM() {
  ReactDOM.render(
    <React.StrictMode><App /></React.StrictMode>,
    document.getElementById('root')
  );
}

class App extends React.Component {
  // We maintain a log of messages that are visible on-screen
  constructor(props) {
    super(props);
    this.state = { msgs: [] };
  }
  componentDidMount() {
    this.appendMsg('Mounted');
  }
  appendMsg(m) {
    const { msgs } = this.state;
    this.setState({ msgs: [ m, ...msgs ] });
  }

  // Our functions are going to assume that the stdlib object exists, but
  // they'll call this if it doesn't. This shows that the stdlib can be loaded
  // many times.
  ensureStdlib() {
    if ( stdlib === undefined ) {
      stdlib = loadStdlib(process.env);
      stdlib.setProviderByName(providerEnv);
      this.appendMsg('Loaded stdlib');
    }
  }

  // This is going to query the network. You'll see that it will work whether
  // you've chosen a wallet provider or whether you've attached that wallet
  async queryChain() {
    this.ensureStdlib();
    const time = await stdlib.getNetworkTime();
    this.appendMsg(`The time is ${time}`);
  }

  // This is going to query the wallet.
  async attachWallet() {
    this.ensureStdlib();
    const acc = await stdlib.getDefaultAccount();
    const addr = acc.getAddress();
    this.appendMsg(`The account is ${addr}`);
    return acc;
  }
  // This is going to query the network by looking at the wallet's balance
  async queryAccount() {
    const acc = await this.attachWallet();
    const bal = await acc.balanceOf();
    this.appendMsg(`Account balance is ${bal}`);
  }

  // This is going to attach to a particular wallet.
  async useMyAlgo() {
    // We delete the wallet to guarantee we get MyAlgo
    delete window.algorand;
    // We load a fresh stdlib, to clear out any state from before
    stdlib = loadStdlib(process.env);
    // We load MyAlgo
    stdlib.setWalletFallback(reach.walletFallback({
      providerEnv, MyAlgoConnect }));
    this.appendMsg('Using MyAlgo');
  }
  // This works the same, except...
  async useWalletConnect() {
    delete window.algorand;
    stdlib = loadStdlib(process.env);
    stdlib.setWalletFallback(reach.walletFallback({
      // ...we use a different fallback here:
      providerEnv, WalletConnect }));
    this.appendMsg('Using WalletConnect');
  }

  render() {
    const { msgs } = this.state;
    const parent = this;
    return (
      <div className="App" id="root">
        <p>
          <button onClick={() => parent.queryChain()}
          >Query Chain</button>
          <button onClick={() => parent.useMyAlgo()}
          >Use MyAlgo</button>
          <button onClick={() => parent.useWalletConnect()}
          >Use WalletConnect</button>
          <button onClick={() => parent.attachWallet()}
          >Attach Wallet</button>
          <button onClick={() => parent.queryAccount()}
          >Query Account</button>
        </p>
        <pre>{JSON.stringify(msgs, null, 2)}</pre>
      </div>
    );
  }
}

renderDOM();
