const { verifyToken } = require("../middlewares");
const bitcoinController = require("../controllers/bitcoin.controller");
const ethereumController = require("../controllers/ethereum.controller");
const erc20Controller = require("../controllers/erc20.controller")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/wallet/bitcoin/getAddress",
    verifyToken,
    bitcoinController.getAddress
  );
  app.get(
    "/api/wallet/bitcoin/getBalance",
    verifyToken,
    bitcoinController.getBalance
  );
  app.get(
    "/api/wallet/bitcoin/getTransactions",
    verifyToken,
    bitcoinController.getTransactions
  );
  app.get(
    "/api/wallet/bitcoin/sendTransaction",
    verifyToken,
    bitcoinController.sendTransaction
  );

  app.get(
    "/api/wallet/ethereum/getAddress",
    verifyToken,
    ethereumController.getAddress
  );
  app.get(
    "/api/wallet/ethereum/getBalance",
    verifyToken,
    ethereumController.getBalance
  );
  app.get(
    "/api/wallet/ethereum/getTransactions",
    verifyToken,
    ethereumController.getTransactions
  );
  app.get(
    "/api/wallet/ethereum/sendTransaction",
    verifyToken,
    ethereumController.sendTransaction
  );
  app.get(
    "/api/wallet/ethereum/getUSDCBalance",
    verifyToken,
    erc20Controller.getUSDCBalance  
  );
  app.get(
    "/api/wallet/ethereum/sendUSDCTransaction",
    verifyToken,
    erc20Controller.sendUSDCTransaction  
  );
};
