import { mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { fetchAllowance, getERC20Token, revoke, web3 } from '../helpers/helpers';


export default class ManualAllowance extends Component {

    constructor(props) {
        super(props)

        this.state = {
            open: false,
            token_address: "",
            token_decimals: null,
            token_name: "",
            contract: "",
            allowance: null
        }

        this.fetchToken = this.fetchToken.bind(this)
        this.checkAllowance = this.checkAllowance.bind(this)
        this.setAllowance = this.setAllowance.bind(this)
        this.handleInput = this.handleInput.bind(this)
        this.toggle = this.toggle.bind(this)
    }

    toggle() {
        this.setState({
            open: !this.state.open
        })
    }

    async fetchToken() {
        const address = this.state.token_address
        if (!web3.utils.isAddress(address)) {
            this.setState({
                token: ""
            })
            toast.error("Invalid token address.")
        } else {
            try {
                const result = await getERC20Token(address)
                const token_decimals = parseInt(result.decimals)

                if (result.name !== null && isNaN(token_decimals)) {
                    throw new Error(`Could not fetch token.`)
                }
                this.setState({
                    token_decimals,
                    token_name: result.name
                })
            } catch (e) {

                toast.error(e.message)
                console.error(e)
            }
        }
    }

    async checkAllowance() {
        try {
            const allowance = await fetchAllowance(this.props.account, this.state.token_address, this.state.contract)
            this.setState({
                allowance
            })
        } catch (e) {
            toast.error(e.message)
            console.error(e)
        }
    }

    async setAllowance() {
        try {
            await revoke(this.props.account, this.state.token_address, this.state.contract)
        } catch (e) {
            toast.error(e.message)
            console.error(e)
        }
    }

    handleInput(event) {
        const target = event.currentTarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        console.log(this, name, value)
        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <div className="manual-allowance">
                <header onClick={this.toggle}>Manual Allowance {(!this.state.open)? <Icon path={mdiPlus} size="22" /> : <Icon path={mdiMinus}size="22" />}</header>
                {(this.state.open) ? <div className="body">
                    <p>
                        This is a manual interaction with the blockchain.
                        <b>
                            Use this at your own risk and only use it on contracts that you trust. If you grant a malicious contract
                            an allowance, that may drain your wallet.
                        </b>
                    </p>
                    <div className="row">

                        {
                            (isNaN(this.state.token_decimals) || this.state.token_name === "") ? <div className="token-input">
                                <input type="text" value={this.state.token_address} name="token_address" placeholder='Token' onInput={this.handleInput} />
                                <button onClick={this.fetchToken}>Get</button>
                            </div> :
                                <div>
                                    <div className='token-field'><input type="text" value={this.state.token_name} readOnly /><input type="text" value={this.state.token_decimals} readOnly /></div>
                                    <input type="text" value={this.state.contract} name="contract" placeholder='Contract' onInput={this.handleInput} />

                                    <div className="toolbox">
                                        <button onClick={this.checkAllowance}>Check Allowance {(this.state.allowance) ? "(" + this.state.allowance + ")" : ""}</button>
                                        <button onClick={this.setAllowance}>Set Allowance</button>
                                    </div>

                                </div>
                        }

                        {/* <input type="text" readOnly />
                        <input type="text" name="" id="" placeholder='Contract' />
                        <button>Set Allowance</button> */}
                    </div>
                </div> : null}
            </div>
        )
    }

}