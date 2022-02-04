import { Component } from "react";
import { shorten } from "../helpers/transaction";
import wallets from "../wallets/wallets";

export default class WalletConnect extends Component {
  constructor(props) {
    super(props);
    this.connectMetaMask = this.connectMetaMask.bind(this);
    this.connectOneWallet = this.connectOneWallet.bind(this);
  }

  render() {

    function Account(props) {
      return <div className="account">
        <span>{props.account}</span><button onClick={props.disconnect}>Disconnect</button>
      </div>
    }

    function ConnectButton(props) {
      return <button onClick={props.connect}>Connect MetaMask</button>
    }

    function State(props) {
      if (props.account) return Account(props)
      else return ConnectButton(props)
    }


    return (
      <div className="signin">
        <State connect={this.connectMetaMask} account={shorten(this.props.account, { length: 5 })} />

      </div>
    );
  }

  connectMetaMask() {
    this.connectWallet("metamask");
  }

  connectOneWallet() {
    this.connectWallet("onewallet");
  }

  async connectWallet(name) {
    const wallet = wallets[name];
    if (wallet) {
      let account = await wallet.connect();
      let network = null;
      if (account) {
        let chainId = await wallet.getChainId();
        network = chainId;
      }

      this.props.update({ account, network });
    } else {
      console.error(`Wallet with name "${name}" is not defined!`);
    }
  }
}
