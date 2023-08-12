const pgConfig = require("./config/pg.config")
const Pool = require('pg').Pool

exports.pool = new Pool({
    user: pgConfig.user,
    host: pgConfig.host,
    database: pgConfig.database,
    password: pgConfig.password,
    port: pgConfig.port,
})

// module.exports = pool