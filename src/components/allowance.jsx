import React, { Component } from "react";
import { fetchAllowance, revoke } from "../helpers/helpers";
import dapps from "../helpers/dapps";
import Icon from "@mdi/react";
import {
  mdiCancel,
  mdiCheckboxBlankCircleOutline,
  mdiCheckboxMarkedCircleOutline,
  mdiSync,
} from "@mdi/js";

import { toast } from "react-toastify";
import { linkToAddress, linkToTransaction } from "../helpers/explorer";
import { shorten } from "../helpers/transaction";

class allowance extends Component {
  constructor(props) {
    super(props);
    this.props = props;


    this.state = {
      allowance: null
    }

    this.setRevoke = this.setRevoke.bind(this);
    this.setRevokeClick = this.setRevokeClick.bind(this);
    this.dappURL = this.dappURL.bind(this);
    this.initRevoke = this.initRevoke.bind(this);
    this.revokeSuccess = this.revokeSuccess.bind(this);
    this.revokeFailed = this.revokeFailed.bind(this);
    this.getAllowance = this.getAllowance.bind(this)
    this.requestAllowance = this.requestAllowance.bind(this)

  }

  dappURL() {
    const dappsKeys = Object.keys(dapps);
    let url = "";
    for (let key of dappsKeys) {
      if (this.props.tx.contractName.toLowerCase().includes(key)) {
        url = dapps[key];
      }
    }
    return url;
  }

  async setRevokeClick() {
    this.setRevoke(this.props.account, this.props.tx.token, this.props.tx.contract)
  }

  async setRevoke(account,
    token,
    contract) {
    this.initRevoke();

    try {
      await revoke(account,
        token,
        contract)
      this.revokeSuccess()
    } catch (e) {
      console.log(e)
      this.revokeFailed(e.message)
    }
  }

  initRevoke() {
    this.props.onStatusChange("pending", this.props.tx);
  }

  revokeSuccess(receipt) {
    toast.success("Successfully Revoked!");
    this.props.onStatusChange("success", this.props.tx);
  }

  revokeFailed(err) {
    toast.error("Could Not Revoke Allowance!");
    console.error(err);
    this.props.onStatusChange("none", this.props.tx);
  }

  renderRevokeButton() {
    if (this.props.status === "pending") {
      return (
        <button className="icon-btn">
          <Icon path={mdiCheckboxBlankCircleOutline} size={1} color="#dbdbdb" />
        </button>
      );
    } else if (this.props.status === "success") {
      return (
        <button className="icon-btn">
          <Icon
            path={mdiCheckboxMarkedCircleOutline}
            size={1}
            color="#78e900"
          />
        </button>
      );
    } else
      return (
        <button
          className="icon-btn"
          name="revoke"
          onClick={
            this.setRevokeClick
          }
        >
          {(this.props.tx.allowanceString === "none") ?
            <Icon
              path={mdiCheckboxMarkedCircleOutline}
              size={1}
              color="#78e900"
            />
            :
            <Icon path={mdiCancel} size={1} color="#e90000" />
          }

        </button>
      );
  }

  getAllowance() {
    return this.state.allowance ? this.state.allowance : this.props.tx.allowanceString
  }

  async requestAllowance() {
    const allowance = await fetchAllowance(this.props.account, this.props.tx.token, this.props.tx.contract)
    this.setState({
      allowance
    })
  }

  render() {
    return (
      <tr key={"allowance-nr-" + this.props.tx.hash} className={this.props.tx.allowanceString}>
        <td className="grid-items">
          {new Date(parseInt(this.props.tx.timestamp) * 1000).toLocaleString()}
        </td>
        <td className="grid-items">
          <a href={linkToAddress(this.props.tx.token)} target="_blank" rel='noreferrer'>
            {this.props.tx.tokenName || shorten(this.props.tx.token)}
          </a>
        </td>
        <td className="grid-items">
          <a href={linkToAddress(this.props.tx.contract)} target="_blank" rel='noreferrer'>
            {shorten(this.props.tx.contract)}
          </a>
        </td>
        <td>
          <a href={linkToTransaction(this.props.tx.hash)} target="_blank" rel='noreferrer'>
            {shorten(this.props.tx.hash)}
          </a></td>
        <td className="grid-items">
          <button className="sync-btn icon-btn" onClick={this.requestAllowance}>
            <span>{this.getAllowance()}</span>
            <Icon path={mdiSync} size={0.8} />
          </button>
        </td>
        <td className="grid-items">{this.renderRevokeButton()}</td>
      </tr>
    );
  }
}

export default allowance;
