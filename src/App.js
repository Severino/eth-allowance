import Web3 from "web3";
import Header from "./components/header";
import Allowances from "./components/allowances";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
const web3 = new Web3(Web3.givenProvider);


function App() {

    const [agreed, setAgreed] = useState(false)

    return (
        <div className="content-wrapper">
            <ToastContainer />
            <main className="content">
                <Header />
                <Allowances web3={web3} />
            </main>
            {(agreed === false) &&
                <div className="modal">
                    <div className="modal-content">
                        <h3>Warning: Experimental Application</h3>
                        <p>
                            This application is a fork, of an Ethereum based application and just ported
                            for the Harmony blockchain. It is not thoroughly tested and you should <b>use
                                it on your own risk!</b>
                        </p>

                        <button onClick={() => setAgreed(true)}>Okay</button>
                    </div>
                </div>
            }
        </div>
    );
}

export default App;
