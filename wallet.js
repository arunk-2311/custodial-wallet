// import * as bip39 from "bip39";
const bip39 = require("bip39");
const BIP32Factory = require("bip32").BIP32Factory;
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const axios = require("axios");
const bitcoin = require("bitcoinjs-lib");
const ethWallet = require("ethereumjs-wallet").default;
const mcWallet = require("multichain-crypto-wallet");
const {storeEthTx} = require("./store-tx")
const ethers = require('ethers')
const ERC20Artifacts = require('../ERC20.json')
const {pool} = require("./pg-pool")
require('dotenv').config()

class Wallet {
  constructor() {
    this.mnemonic = process.env.MNEMONIC;
    this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
    this.bitcoinNetwork = bitcoin.networks.bitcoin;
  }

  //BITCOIN

  async getBitcoinKeyPair(index) {
    const seed = await bip39.mnemonicToSeed(this.mnemonic);
    const root = bip32.fromSeed(seed, this.network);
    const keyPair = root.derivePath(`m/84'/0'/0'/0/${index}`);
    return keyPair;
  }

  async getBitcoinAddress(index) {
    const keyPair = await this.getBitcoinKeyPair(index);
    const address = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    }).address;

    return address;
  }

  async getBitcoinBalance(index) {
    const address = await this.getBitcoinAddress(index);
    const balance = mcWallet.getBalance({ address, network: "bitcoin" });
    return balance;
  }

  async getBitcoinTransactions(index) {
    const address = await this.getBitcoinAddress(index);
    const res = await axios.get(`https://blockchain.info/rawaddr/${address}`);
    return res.data.txs;
  }

  async sendBitcoinTransaction(index, amount, to) {
    const keyPair = await this.getBitcoinKeyPair(index);
    try {
      const transfer = await mcWallet.transfer({
        amount,
        recipientAddress: to,
        network: "bitcoin",
        privateKey: keyPair.privateKey.toString("hex"),
      });
    } catch (error) {
      throw new Error("INSUFFICIENT BALANCE");
    }
  }

  // ETHEREUM

  async getEthereumKeyPair(index) {
    const seed = await bip39.mnemonicToSeed(this.mnemonic);
    const root = bip32.fromSeed(seed, this.network);
    const keyPair = root.derivePath(`m/44'/60'/0'/0/${index}`);
    return keyPair;
  }

  async getEthereumAddress(index) {
    const keyPair = await this.getEthereumKeyPair(index);
    const address = ethWallet.fromPrivateKey(keyPair.privateKey);
    return address.getAddressString();
  }

  async getEthereumBalance(index) {
    const address = await this.getEthereumAddress(index);
    const balance = mcWallet.getBalance({
      address,
      network: "ethereum",
      rpcUrl: process.env.INFURA_GOERLI_KEY,
    });
    return balance;
  }

  async getEthereumTransactions(index) {
    const address = (await this.getEthereumAddress(index));
    const getQuery = `SELECT * FROM transactions WHERE (from_address ILIKE '${address}' OR to_address ILIKE '${address}') ORDER BY tx_no ASC`
    
    try {
      const res = await pool.query(getQuery)
      return res.rows;
    } catch (err) {
      return err.stack;
    }
  }

  async sendEthereumTransaction(index, amount, to) {
    const keyPair = await this.getEthereumKeyPair(index);
    console.log(keyPair.privateKey.toString("hex"))
    try {
      const transfer = await mcWallet.transfer({
        amount,
        recipientAddress: to,
        network: "ethereum",
        privateKey: keyPair.privateKey.toString("hex"),
        rpcUrl: process.env.INFURA_GOERLI_KEY,
      });
      const tx = await storeEthTx(transfer.hash)
      return tx
    } catch (error) {
      throw error;
    }
  }

  async getERC20Balance(index,contractAddress){
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_GOERLI_KEY);
    const address = await this.getEthereumAddress(index);

    const erc20Contract = new ethers.Contract(contractAddress,ERC20Artifacts.ABI,provider);
    const erc20Balance = (await erc20Contract.balanceOf(address)).toString();

    return erc20Balance;
  }

  async sendERC20Transaction(index,amount,to,contractAddress,coinName) {
    const keyPair = await this.getEthereumKeyPair(index);
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_GOERLI_KEY)
    const signer = new ethers.Wallet(keyPair.privateKey.toString("hex"), provider);

    const erc20Contract = new ethers.Contract(contractAddress,ERC20Artifacts.ABI,signer);
    try {
      const transfer = await erc20Contract.transfer(to,amount)
      const txData = await storeEthTx(transfer.hash,coinName)
      return txData;
    } catch (error) {
      throw error
    }
  }
}
const wallet = new Wallet();

async function getkeys(){
  const keys = await wallet.getEthereumKeyPair(1)
  return keys
}


getkeys().then((value) => {
  console.log(value.publicKey,value.privateKey);
})

module.exports = wallet;
