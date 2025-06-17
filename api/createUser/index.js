const database = require('../database');

module.exports = async function (context, req) {
    return await database.createUser(context, req);
};
