const db = require("../models");
const User = db.user;
const wallet = require("../wallet");


exports.getAddress = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  res.json(await wallet.getBitcoinAddress(index));
};

exports.getBalance = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  res.json(await wallet.getBitcoinBalance(index));
};

exports.getTransactions = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;
  res.json(await wallet.getBitcoinTransactions(index));
};

exports.sendTransaction = async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.accountId;

  try {
    const txId = await wallet.sendBitcoinTransaction(
      index,
      req.body.amount,
      req.body.to
    );
    res.json(txId);
  } catch (error) {
    res.json(error.message);
  }
};
