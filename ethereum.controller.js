const db = require("../models");
const User = db.user;
const wallet = require("../wallet");

exports.getAddress = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  res.json(await wallet.getEthereumAddress(index));
};

exports.getBalance = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  res.json(await wallet.getEthereumBalance(index));
};

exports.getTransactions = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  
  res.status(200).json(await wallet.getEthereumTransactions(index));
};

exports.sendTransaction = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;

  try {
    const txId = await wallet.sendEthereumTransaction(
      index,
      req.body.amount,
      req.body.to
    );
    res.json(txId);
  } catch (error) {
    res.json(error.message);
  }
};
