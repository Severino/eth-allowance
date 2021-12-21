const { default: Wallet } = require("./wallet");

export default class MetaMask extends Wallet {

    static get name() {
        return "metamask"
    }

    static async getChainId() {
        let hex = await window.ethereum.chainId
        return parseInt(hex, 16);
    }

    static available() {
        return window.ethereum && window.ethereum.isMetaMask
    }

    static async connect() {
        return this.requestAccounts()
    }

    static requestAccounts() {
        return new Promise((resolve, reject) => {
            if (!window.ethereum) reject("Metamask not found!")
            else {
                window.ethereum
                    .request({ method: 'eth_requestAccounts' })
                    .then((accounts) => resolve(accounts[0]))
                    .catch((err) => {
                        if (err.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            // If this happens, the user rejected the connection request.
                            reject('Please connect to MetaMask.');
                        } else {
                            reject(err);
                        }
                    });
            }
        })
    }
}