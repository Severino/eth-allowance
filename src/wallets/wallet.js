export default class Wallet {
    /**
     * Readonly name
     */
    // static get name() {
    //     throw new Error("Call of abstract method 'name' on wallet.")
    // }

    static available() {
        throw new Error("Call of abstract method 'available' on wallet: " + this.name)
    }

    static async connect() {
        throw new Error("Call of abstract method 'connect' on wallet: " + this.name)
    }

    static on(name, func) {
        if (!this.listeners[name]) this.listeners[name] = []
        this.listeners[name].push(func)
    }

    static off(name, func) {
        const funcIdx = this.listeners[name]?.indexOf(func)
        if (funcIdx !== -1) {
            this.listeners[name].splice(funcIdx, 1)
        }
        else return false
    }

    static accountChanged() {
        throw new Error("Call of abstract method 'accountChanged' on wallet: " + this.name)
    }

    static networkChanged() {
        throw new Error("Call of abstract method 'networkChanged' on wallet: " + this.name)
    }

    static async getChainId(){
        throw new Error("Call of abstract method 'getNetwork' on wallet: " + this.name)
    }

}