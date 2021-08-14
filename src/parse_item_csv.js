const csv = require("csvtojson")
const fs = require("fs")

const csvFilePath = "./constants/items.csv"

console.log("Converting Items JSON...")
csv()
    .fromFile(csvFilePath)
    .then(jsonObj => {
        fs.writeFileSync(
            "./constants/items.json",
            JSON.stringify(jsonObj, null, 2)
        )
        console.log("Items converted!")
    })
