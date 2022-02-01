export function getExplorerFromChainId(id){
    switch (parseInt(id,16)) {
        case 1666700000:
            return "https://explorer.pops.one"
        case 1666600000:
            return "https://explorer.harmony.one"
        default: {
            console.warn("Could not find explorer for chain ", id)
            return "https://explorer.harmony.one"
        }
    }
}

export function linkToAddress(address){
    return getExplorerFromChainId(window.ethereum.chainId) + "/address/"  + address
}

export function linkToTransaction(tx){
    return getExplorerFromChainId(window.ethereum.chainId) + "/tx/"  + tx
}