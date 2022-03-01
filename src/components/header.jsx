import Icon from "@mdi/react";
import { mdiFlask, mdiSync } from '@mdi/js';
import React, { Component } from 'react';
import '../App.css';
import pkg from "../../package.json"

class header extends Component {


    render() {
        return (
            <div>
                <div className="experimental-warning">
                    <Icon path={mdiFlask} size="16" color="white" />
                    Experimental { pkg.version }
                </div>
                <div className="jumbotron">
                    <div id="titles">
                        <img src="harmony-lock-logo.png" alt="Harmony Lock Logo" />
                        <h1>Harmony Allowance</h1>
                        <h2>Find &amp; revoke all the addresses that can spend your HRC20 tokens</h2>

                        <p>
                            The app looks up your transaction history for approval transactions.
                            If it finds some it shows them in the table. When the transaction has an input of
                            0 (which means you revoked the allowance) then the transaction will be excluded from the list.
                            You can now show those transactions by clicking the 'Show Zero Allowance' button.
                        </p>
                        <p>You can verify that the allowance is set to zero, by clicking in the allowance row with the
                            <Icon path={mdiSync} size="16" color="rgb(0, 174, 233)" /> Symbol. It may occur, that the allowance shows 'some' before you click it and 0
                            after. This happens if set a specific spending limit and then you spent it all. The app won't notice that, as it just looks at the input.
                        </p>

                        <p>To cut the RPC some slack, a 'Load More' button was introduced, that lets you load your transactions in little bits.</p>

                        <p>Please report bugs and feature requests here:<br /> <a href="https://github.com/Severino/harmony-allowance/issues">https://github.com/Severino/harmony-allowance/issues</a></p>
                    </div>
                </div>
            </div>
        )
    }
}

export default header;
