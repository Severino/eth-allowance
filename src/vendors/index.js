const { default: VendorMap } = require("../helpers/vendormap.js")
const viperchef = require("./viperchef.js")
const viperlp = require("./viperlp.js")



let vendors = new VendorMap()

vendors.add(viperchef)
vendors.add(viperlp)

module.exports = vendors.object