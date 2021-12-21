
export default class VendorMap {
    constructor() {
        this.map = {}
    }

    add(vendor) {
        const { name, abi, contract } = vendor
        if (!name || !abi || !contract) throw new Error("Vendor is invalid. Must have name, abi and contract.", { name, abi, contract })
        this.map[contract] = vendor
    }

    get object() {
        return this.map
    }
}