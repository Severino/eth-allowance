import React, { Component } from "react";
import { getEndpoint, fetchTransactions, getName } from "../helpers/helpers";
import Allowance from "./allowance";
import Spinner from "./spinner";
import Tip from "./tip";
import WalletConnect from "./walletconnect";
import { toast } from "react-toastify";

class allowances extends Component {
  state = {
    renderedTransactions: [],
    account: undefined,
    fee: null,
    loading: false,
    totalTransactionCount: null,
    currentTransactionCount: null,
  };

  constructor(props) {
    super(props);
    this.props = props;
    this.walletUpdated = this.walletUpdated.bind(this);
    this.statusChanged = this.statusChanged.bind(this);
  }

  componentDidMount() {
    if (this.state.account) {
      this.init()
        .then((obj) => {
          this.setState(obj);
        })
        .catch((err) => {
          this.logError(err);
        });
    }
  }

  async init() {
    if (!this.state.account || !this.state.network) return null;

    try {
      this.setState({ loading: true });

      const endpoint = getEndpoint(this.state.network);
      if (!endpoint)
        throw new Error("Wrong network! Change network and reload.");

      let txs = await fetchTransactions(endpoint, this.state.account);
      txs = txs.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

      this.setState({
        totalTransactionCount: txs.length,
        currentTransactionCount: 0,
      });

      for (let i = 0; i < txs.length; i++) {
        let tx = txs[i];
        try {
          tx.contractName = await getName(txs[i].contract);
        } catch (e) {
          tx.contractName = "COULD NOT FETCH NAME: " + e;
        }

        try {
          tx.approvedName = await getName(txs[i].approved);
        } catch (e) {
          tx.approvedName = "COULD NOT FETCH NAME: " + e;
        }

        tx.status = "none";
        tx.id = i;
        this.setState((prevState) => ({
          renderedTransactions: [...prevState.renderedTransactions, tx],
          currentTransactionCount: i + 1,
        }));
      }

      this.setState({
        loading: false,
      });
    } catch (e) {
      this.setError(e);
    }
  }

  setError(msg) {
    toast.error("Something went wrong!");
    console.error(msg);
  }

  statusChanged(status, tx) {
    let txs = this.state.renderedTransactions;
    let idx = txs.findIndex((arr_tx) => arr_tx.hash === tx.hash);
    if (idx !== -1) {
      txs[idx].status = status;
      this.forceUpdate();
    }
  }

  render() {
    let elements = "";
    if (this.state.renderedTransactions.length > 0) {
      elements = this.state.renderedTransactions.map((tx) => {
        return (
          <Allowance
            tx={tx}
            key={"allowance-" + tx.hash}
            web3={this.props.web3}
            id={tx.contract}
            account={this.state.account}
            status={tx.status}
            onStatusChange={this.statusChanged}
          />
        );
      });
    }

    function RenderTable(props) {
      if (!props.elements) return <div />;
      return (
        <table>
          <thead>
            <tr>
              <td className="grid-items">#</td>
              <td className="grid-items">Time</td>
              <td className="grid-items">Contract</td>
              <td className="grid-items">Approved Address</td>
              <td className="grid-items">Allowance</td>
              <td className="grid-items">Revoke</td>
            </tr>
          </thead>
          <tbody>{props.elements}</tbody>
        </table>
      );
    }

    return (
      <div className="allowance">
        <WalletConnect
          account={this.state.account}
          network={this.state.network}
          update={this.walletUpdated}
        />

        <Tip
          account={this.state.account}
          address="0x23F822FC0CA75622cF6C48A4fba508E068f0E15b"
        />
        {this.renderSpinner(this.state.loading)}
        <RenderTable elements={elements} />
      </div>
    );
  }

  renderSpinner(loading) {
    if (loading)
      return (
        <Spinner
          total={this.state.totalTransactionCount}
          current={this.state.currentTransactionCount}
        />
      );
    else return <div />;
  }

  walletUpdated({ account, network } = {}) {
    this.setState({
      account,
      network,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.account !== this.state.account) {
      this.init();
    }
  }
}
export default allowances;
