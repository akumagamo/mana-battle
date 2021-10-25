const click = require("../DSL/click")
module.exports = async page => {
    await click(1280 / 2, 768 / 2, page)
}
