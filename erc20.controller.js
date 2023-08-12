const db = require("../models");
const User = db.user;
const wallet = require("../wallet");
const ERC20Artifacts = require('../../ERC20.json')

exports.getUSDCBalance = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  // const USDC_ADDRESS = ERC20Artifacts.Address.USDC
  const USDC_ADDRESS = ERC20Artifacts.Address.Faucet

  res.json(await wallet.getERC20Balance(index,USDC_ADDRESS));
};

exports.sendUSDCTransaction = async (req,res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  const USDC_ADDRESS = ERC20Artifacts.Address.Faucet
  const coinName = "USDC"

  try {
    const txId = await wallet.sendERC20Transaction(
      index,
      req.body.amount,
      req.body.to,
      USDC_ADDRESS,
      coinName
    );
    res.json(txId);
  } catch (error) {
    res.json(error.message);
  }
}