import React, { Component } from 'react';
import '../App.css';

class header extends Component {


    render() {
        return (
            <div>
                <div className="jumbotron">
                    <div id="titles">
                        <img src="harmony-lock-logo.png" alt="Harmony Lock Logo" />
                        <h1>Harmony Allowance</h1>
                        <h2>Find &amp; revoke all the addresses that can spend your tokens</h2>
                    </div>
                </div>
            </div>
        )
    }
}

export default header;
