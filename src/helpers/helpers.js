import { toast } from 'react-toastify';
import { shorten } from './transaction.js';

const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
const BN = web3.utils.BN;
const request = require('superagent');
const approvalHash = "0x095ea7b3";
const { ERC20ABI, ERC721ABI } = require("./ABI.js");
const {
    toBech32,
    fromBech32,
} = require('@harmony-js/crypto');


export const unlimitedAllowance = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
export const noneAllowance = "0000000000000000000000000000000000000000000000000000000000000000";


/**
 * Returns the rendpoint URI if the chainId is supported,
 * otherwise null.
 * @param {int} chainId 
 * @returns {string | null} 
 */
export function getEndpoint(chainId) {

    switch (parseInt(chainId, 10)) {
        case 1666600000:
            return "https://harmony-0-rpc.gateway.pokt.network"
        case 1666700000:
            return "https://api.s0.pops.one"
        default:
            return null;
    }
}



export async function fetchTransactions(endpoint, address, {
    page = 0,
    num = 25
}) {
    try {
        const bechAddress = toBech32(address)

        let result = await request.post(endpoint)
            .set('Content-Type', 'application/json')
            .accept("application/json")
            .send({
                "jsonrpc": "2.0",
                "method": "hmyv2_getTransactionsHistory",
                "params": [{
                    "address": bechAddress,
                    "pageIndex": page,
                    "pageSize": num,
                    "fullTx": true,
                    "txType": "ALL",
                    "order": "DESC"
                }],
                "id": 1
            })

        return result.body.result.transactions
    } catch (e) {
        throw e;
    }
}

export async function getApprovalTransactions(transactions) {
    let approveTransactions = {};
    if (transactions?.length > 0) {
        for (let tx of transactions.values()) {

            if (tx.input.includes(approvalHash)) {

                const hash = tx.hash
                const token = web3.utils.toChecksumAddress(fromBech32(tx.to));
                const contract = web3.utils.toChecksumAddress("0x" + tx.input.substring(34, 74));
                const timestamp = tx.timestamp
                const allowance = tx.input.substring(74);


                let allowanceString = (allowance.includes(unlimitedAllowance)) ? "unlimited" : (allowance.includes(noneAllowance)) ? "none" : "some";


                let approveObj = {
                    hash,
                    timestamp,
                    contract,
                    token,
                    allowance,
                    allowanceString
                };

                approveTransactions[contract] = approveTransactions[contract] || {}
                if (!approveTransactions[contract][token]) {
                    approveTransactions[contract][token] = []
                }
                approveTransactions[contract][token].push(approveObj)

                // if (parseInt(allowance, 16) !== 0) {
                //     approveTransactions.push(approveObj);
                // } else {
                //     filteredTransactions.push({ contract, token, timestamp })
                //     // TODO clean up
                //     // Remove all previous additions of this approval transaction as it is now cleared up
                //     approveTransactions = approveTransactions.filter((val) => {
                //         return !(val.approved === approveObj.approved);
                //     });
                // }
            }
        }
    }

    return approveTransactions;
}

export function getERC20Contract(address) {
    return new web3.eth.Contract(ERC20ABI, address);
}

export async function getName(contractAddress) {
    let name = shorten(contractAddress, { length: 4 })
    try {
        const contract = getERC20Contract(contractAddress)
        name = await contract.methods.name().call();
    } catch (e) {
        // name not found, just use contract address
        console.error(e);
    }

    return name
}

export async function fetchAllowance(account, token, spender) {
    let allowance = undefined
    try {
        const contract = getERC20Contract(token)
        const _allowance = await contract.methods.allowance(account, spender).call()
        const decimals = await contract.methods.decimals().call()
        const floatingPointPrecision = (decimals - 6 > 0) ? 6 : decimals
        const floatedDecimals = decimals - floatingPointPrecision
        const allowanceBN = new BN(_allowance).div(new BN(10).pow(new BN(floatedDecimals)))
        const max = 1000000000 * Math.pow(10, floatingPointPrecision)

        allowance = (_allowance === "0") ? "0" :
            (allowanceBN.gt(new BN(max))) ? "> 1 Billion" :
                (allowanceBN.eq(new BN(0))) ? `< 0.${"0".repeat(floatingPointPrecision)}` :
                    (allowanceBN.toNumber() / (Math.pow(10, floatingPointPrecision)).toFixed(floatingPointPrecision))
    } catch (e) {
        const err_str = "Could not get allowance!"
        toast.error(err_str)
        console.error(err_str, e)
    }
    return allowance
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
