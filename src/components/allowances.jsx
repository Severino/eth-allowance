import React, { Component } from "react";
import { getEndpoint, fetchTransactions, getName, getApprovalTransactions } from "../helpers/helpers";
import Allowance from "./allowance";
import Spinner from "./spinner";
import Tip from "./tip";
import WalletConnect from "./walletconnect";
import { toast } from "react-toastify";
import Icon from "@mdi/react";
import { mdiEye, mdiEyeOff } from "@mdi/js";
class allowances extends Component {
  state = {
    approvalMap: {},
    approveTransactions: [],
    account: undefined,
    fee: null,
    loading: false,
    totalTransactionCount: null,
    currentTransactionCount: null,
    page: 0,
    pageNum: 100,
    moreTransactions: true,
    showZeroAllowance: false
  };

  constructor(props) {
    super(props);
    this.props = props;
    this.walletUpdated = this.walletUpdated.bind(this);
    this.statusChanged = this.statusChanged.bind(this);
    this.loadMore = this.loadMore.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.init = this.init.bind(this)
  }

  componentDidMount() {
    this.init()
      .then((obj) => {
        this.setState(obj);
      })
      .catch((err) => {
        toast.error("Could not load application.")
        console.error(err);
      });
  }

  async init() {
    if ((!this.state.account || !this.state.network) && window.ethereum != null) {
      this.setState({
        account: window.ethereum.selectedAddress,
        network: parseInt(window.ethereum.chainId, 16)
      })
    };

    if (!this.state.account || !this.state.network) return null;

    try {
      await this.updateTransactions()
    } catch (e) {
      toast.error(`Could not fetch transactions - try reloading the page.`)
      console.error(e);
    }
  }

  async updateTransactions() {
    this.setState({ loading: true });

    const endpoint = getEndpoint(this.state.network);
    if (!endpoint)
      throw new Error("Wrong network! Change network and reload.");

    let txs = await fetchTransactions(endpoint, this.state.account, {
      page: this.state.page,
      num: this.state.pageNum
    });

    if (txs.length < this.state.pageNum) {
      await this.setState({
        moreTransactions: false
      })
    }

    const approvalMap = await getApprovalTransactions(txs)
    const previousApprovalMap = this.state.approvalMap

    /**
     * Update approval map
     */
    for (let [contractAddress, tokens] of Object.entries(approvalMap)) {
      if (!previousApprovalMap[contractAddress]) previousApprovalMap[contractAddress] = {}
      for (let [tokenAddress, approvalObjects] of Object.entries(tokens)) {
        if (!previousApprovalMap[contractAddress][tokenAddress]) previousApprovalMap[contractAddress][tokenAddress] = []
        previousApprovalMap[contractAddress][tokenAddress].push(...approvalObjects)
      }
    }


    let approveTransactions = []
    for (let tokens of Object.values(previousApprovalMap)) {
      for (let approvalObjects of Object.values(tokens)) {
        const newestApproval = approvalObjects[0]

        // if (approvalObjects[0].allowance !== noneAllowance) {
        const approval = approvalObjects[0]
        approveTransactions.push(approval)
        approval.tokenName = await getName(approval.token)
        // }


        for (let i = 1; i < approvalObjects.length; i++) {
          if (newestApproval.timestamp - approvalObjects[i].timestamp < 0) {
            console.error("CODE CONTAINS ERRORS: OLDER OBJECT WAS ADDED BEFORE!!!!")
          }
        }
      }
    }

    approveTransactions = approveTransactions.sort((a, b) => {
      return b.timestamp - a.timestamp
    })

    await this.setState({
      loading: false,
      approveTransactions,
      approvalMap: previousApprovalMap
    });
  }

  setError(msg) {
    toast.error("Something went wrong!");
    console.error(msg);
  }

  statusChanged(status, tx) {
    let txs = this.state.approveTransactions;
    let idx = txs.findIndex((arr_tx) => arr_tx.hash === tx.hash);
    if (idx !== -1) {
      txs[idx].status = status;
      this.forceUpdate();
    }
  }

  async loadMore() {
    await this.setState({
      page: this.state.page + 1
    })
    try {
      this.updateTransactions()
    } catch (e) {
      this.setState({
        page: this.state.page - 1
      })
      toast.error(`Some error occured on load: try again!`)
      console.error(e);
    }
  }

  render() {
    const that = this
    let elements = "";
    if (this.state.approveTransactions.length > 0) {
      elements = this.state.approveTransactions.map((tx) => {
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

      const revokedClass = that.state.showZeroAllowance ? "show-revoked" : "hide-revoked"
      return (
        <table className={revokedClass}>
          <thead>
            <tr>
              <td className="grid-items">Time</td>
              <td className="grid-items">Token</td>
              <td className="grid-items">Approved Address</td>
              <td className="grid-items">Tx.-Hash</td>
              <td className="grid-items">Allowance</td>
              <td className="grid-items">Revoke</td>
            </tr>
          </thead>
          <tbody>{props.elements}</tbody>
        </table>
      );
    }
    function TransactionsContainer(props) {
      return (
        <div>
          <Tip
            account={props.account}
            address="0x23F822FC0CA75622cF6C48A4fba508E068f0E15b"
          />

          <div className="options-btn interactive" onClick={() => that.setState({
            showZeroAllowance: !that.state.showZeroAllowance
          })}>
            {
              (that.state.showZeroAllowance) ?
                <Icon path={mdiEyeOff} size={0.9} /> : <Icon path={mdiEye} size={0.9} />
            }
            <span>
              {
                (that.state.showZeroAllowance) ?
                  "Hide Zero Allowances" : "Show Zero Allowances"
              }
            </span>
          </div>
          <RenderTable elements={elements} />
          {
            (props.loading) ?
              <Spinner />
              : (props.transactions.length === 0) ? <div className="info">No Approval Transactions Found</div> : (that.state.moreTransactions) ? <button className="more-btn center" onClick={that.loadMore}>Load More ...</button> : <div className="info">End Of Transactions History</div>
          }
        </div >
      )
    }

    return (
      <div className="allowance">
        <WalletConnect
          account={this.state.account}
          network={this.state.network}
          disconnect={this.disconnect}
          update={this.walletUpdated}
        />
        {((this.state.account) ?
          <TransactionsContainer account={this.state.account} loading={this.state.loading} transactions={this.state.approveTransactions} /> : "")}
      </div>
    );
  }

  disconnect() {
    this.setState({
      account: null
    })
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
