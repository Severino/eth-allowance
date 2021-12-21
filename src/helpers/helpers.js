let Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider);
let request = require('superagent');
const approvalHash = "0x095ea7b3";
const unlimitedAllowance = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const { ERC20ABI, ERC721ABI } = require("./ABI.js");
const vendors = require("../vendors")
const {
    toBech32,
    fromBech32,
} = require('@harmony-js/crypto');

/**
 * Returns the rendpoint URI if the chainId is supported,
 * otherwise null.
 * @param {int} chainId 
 * @returns {string | null} 
 */
export function getEndpoint(chainId) {

    switch (parseInt(chainId, 10)) {
        case 1666600000:
            return "https://api.harmony.one"
        case 1666700000:
            return "https://api.s0.pops.one"
        default:
            return null;
    }
}



export async function fetchTransactions(endpoint,address) {
    try {
        let approveTransactions = [];
        let page = 0
        const bechAddress = toBech32(address)
        let txs
        do {
            let result = await request.post(endpoint)
                .set('Content-Type', 'application/json')
                .accept("application/json")
                .send({
                    "jsonrpc": "2.0",
                    "method": "hmyv2_getTransactionsHistory",
                    "params": [{
                        "address": bechAddress,
                        "pageIndex": page,
                        "pageSize": 1000,
                        "fullTx": true,
                        "txType": "ALL",
                        "order": "ASC"
                    }],
                    "id": 1
                })

            txs = result.body.result.transactions

            if (txs?.length > 0) {
                for (let tx of txs.values()) {

                    if (tx.input.includes(approvalHash)) {
                        let approveObj = {};
                        tx.to = fromBech32(tx.to)
                        approveObj.hash = tx.hash
                        approveObj.timestamp = tx.timestamp
                        approveObj.contract = web3.utils.toChecksumAddress(tx.to);
                        approveObj.approved = web3.utils.toChecksumAddress("0x" + tx.input.substring(34, 74));
                        let allowance = tx.input.substring(74);
                        if (allowance.includes(unlimitedAllowance)) {
                            approveObj.allowance = "unlimited";
                        } else {
                            approveObj.allowance = "some";
                            approveObj.allowanceUnEdited = allowance;
                        }

                        if (parseInt(allowance, 16) !== 0) {
                            approveTransactions.push(approveObj);
                        } else {
                            // TODO clean up
                            // Remove all previous additions of this approval transaction as it is now cleared up
                            approveTransactions = approveTransactions.filter((val) => {
                                return !(val.approved === approveObj.approved);
                            });
                        }
                    }


                }
            }
            page++
        } while (txs && txs.length > 0)

        console.log("Approval transactions found: " + approveTransactions.length)
        return approveTransactions;
    } catch (e) {
        throw e;
    }
}

export async function getName(contractAddress) {
    let vendor = vendors[contractAddress]
    const abi = vendor?.abi || ERC20ABI

    let contract = new web3.eth.Contract(abi, contractAddress);

    let name
    try {
        name = await contract.methods.name().call();
    } catch (e) {
        // name not found, just use contract address
        console.error(e);
        const length = 4
        name = vendor?.name || contractAddress.substring(0, length + 2) + "..." + contractAddress.substring(contractAddress.length - length);
    }

    return name
}

export async function is721(contractAddress, tokenId) {
    let contract = new web3.eth.Contract(ERC721ABI, contractAddress);
    try {
        await contract.methods.ownerOf(tokenId).call();
        return true; // if this call passes, it must be ERC721
    } catch (e) {
        // method doesn't exist, can't be 721
        return false;
    }
}
