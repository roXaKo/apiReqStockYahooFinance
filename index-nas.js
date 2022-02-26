const fs = require('fs')
const express = require('express')
const app = express()
const https = require('https')
const Mongoose = require('mongoose')
app.use(express.json)

Mongoose.connect('mongodb://localhost/fintec')
    .then(() => console.log('connected to mongodb'))
    .catch(() => console.log('connecting do mongodb failed'))

const nasSchema = new Mongoose.Schema({
    "Company Name": String,
    "Financial Status": String,
    "Market Category": String,
    "Round Lot Size": Number,
    "Security Name": String,
    "Symbol": String,
    "Test Issue": String
})
const exchange = Mongoose.model("nasdaq", nasSchema)


async function getNas() {
    var nasSym = await exchange.find().sort({ Symbol: 1 }).select({ Symbol: 1, _id: 0 });
    for (let i = 0; i < nasSym.length; i++) {
        nasSym[i] = nasSym[i].Symbol
    };
    return nasSym;
}


const sleep = (mil) =>{
    return new Promise(resolve => setTimeout(resolve, mil))
}


async function writer(data, symbol) {
    await fs.writeFile(`./data/nasdaq/${symbol}.txt`, data, function (err) {
        if (err) return console.log("some error")
        console.log("saved")
    })
}
const nasSym = getNas()
getNas().then(async function () {
    var nas = await nasSym;
    async function geter() {
        for (let symbol of await nasSym) {
            await sleep(1000)
            end = ""
            const adress = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}?period1=1609718400&period2=1641168000&interval=1d&events=history&includeAdjustedClose=true`
            console.log(adress)
            await https.get(adress, async (res) => {
                if(res.statusCode == 404) return
                res.on('data', (data) => {

                    end = end + data.toString()
                    writer(end, symbol)
                })
                console.log("saved")
            })
        }



    }
    geter()
})

let end = ""

console.log("DONE!")
// geter()