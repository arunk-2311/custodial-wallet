const mongoose = require("mongoose");

const autoIncrementModelID = require("./counter.model");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    min: 5,
    max: 50,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountId: {
    type: Number,
    required: true,
    default: 0,
  },
});

userSchema.pre("save", function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID("accountId", this, next);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
