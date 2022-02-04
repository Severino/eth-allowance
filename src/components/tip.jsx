import { Component } from "react";
import { toHex, toWei } from "web3-utils";
import "../styles/tip.css";

export default class Tip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 10,
      tipped: false,
    };
    this.updateValue = this.updateValue.bind(this);
    this.sendTip = this.sendTip.bind(this);
  }

  render() {
    if (!this.props.account) return <div />;

    return (
      <div className="tip">
        {!this.state.tipped && (
          <div>
            <p>
              Thank you for using <i>Harmony Allowance</i>
            </p>
            <p>
              If it was useful for you, please consider giving a small tip to
              the developer. This will help to keep this and future projects
              running!
            </p>

            <div className="input">
              <input
                type="number"
                value={this.state.value}
                onInput={this.updateValue}
              />
              <button id="tip-button" onClick={this.sendTip}>
                Tip
              </button>
            </div>
          </div>
        )}

        {this.state.tipped && <p>THANK YOU FOR YOUR SUPPORT!!!</p>}
      </div>
    );
  }

  updateValue(event) {
    this.setState({
      value: event.target.value,
    });
  }

  sendTip() {
    window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: this.props.account,
            to: this.props.address,
            value: toHex(toWei(this.state.value.toString())),
          },
        ],
      })
      .then(() => {
        this.setState({
          tipped: true,
        });
      })
      .catch(console.error);
  }
}
