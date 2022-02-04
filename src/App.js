import Web3 from "web3";
import Header from "./components/header";
import Allowances from "./components/allowances";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
const web3 = new Web3(Web3.givenProvider);




const agreementStorageName = 'experimental-aggreement'

function getAgreement() {

    let agreement = {
        agreed: false,
        timestamp: Date.now()
    }

    try {
        const str = window.localStorage.getItem(agreementStorageName)
        let storedAgreement = JSON.parse(str)
        if (storedAgreement.agreed && storedAgreement.timestamp) {
            const days = 30
            if (Date.now() - storedAgreement.timestamp > days * 24 * 60 * 60 * 1000) {
                storedAgreement.agreed = false
            }
            agreement = storeAgreement
        }
    } catch (e) {
        console.warn(`Could not load stored agreement.`)
    }

    return agreement.agreed
}

function storeAgreement(val) {
    window.localStorage.setItem(agreementStorageName, JSON.stringify({
        timestamp: (new Date()).getTime(),
        agreed: val
    }))
}

function App() {

    const storedAgreement = getAgreement()


    const [agreed, setAgreed] = useState(storedAgreement)

    function agree() {
        setAgreed(true)
        storeAgreement(true)
    }

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

                        <button onClick={agree}>Okay</button>
                    </div>
                </div>
            }
        </div>
    );
}

export default App;
