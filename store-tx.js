require('dotenv').config()
const mcWallet = require("multichain-crypto-wallet");
const InputDataDecoder = require('ethereum-input-data-decoder');
const ERC20Artifacts = require('../ERC20.json')
const ethers = require('ethers')
const {pool} = require("./pg-pool")

const getEthereumTx = async (hash) => { 
    // Get the transaction receipt on Ethereum network.
    const receipt = await mcWallet.getTransaction({
        hash: hash,
        network: 'ethereum',
        rpcUrl:process.env.INFURA_GOERLI_KEY,
    }); // NOTE - For other EVM compatible blockchains all you have to do is change the rpcUrl.

    return receipt
}

class buildTx {
    constructor(tx,coinName) {
        
        this.hash = tx.hash
        this.from = tx.from
        this.to = tx.to

        if (typeof coinName === 'undefined') {
            this.coin = 'ethereum'
            // this.method = "transfer(to,value)"
            this.value = ethers.formatEther(tx.value.toNumber())
        }else{
            const decoder  = new InputDataDecoder(ERC20Artifacts.ABI)
            const txDecoded = decoder.decodeData(tx.data);
            
            this.coin = coinName
            // this.method = txDecoded.method + "(" + txDecoded.names[0] + "," + txDecoded.names[1] + ")";
            this.value = ethers.formatEther(txDecoded.inputs[1].toNumber());
        }

    }
}

exports.storeEthTx = async (hash,coin) => {
    const tx = await getEthereumTx(hash)
    console.log(coin)
    const txObj = new buildTx(tx,coin)

    pool.query('INSERT INTO transactions (tx_hash,coin_type,from_address,to_address,value) VALUES ($1,$2,$3,$4,$5) RETURNING *', [txObj.hash,txObj.coin,txObj.from,txObj.to,txObj.value], (error, results) => {
        if (error) {
        throw error
        }
        console.log(`transaction added with ID: ${results.rows[0].tx_no}`)
    })

    return txObj
}
