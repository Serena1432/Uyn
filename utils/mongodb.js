const mongoose = require("mongoose");

module.exports = (client) => {
    client.initDB = (url) => {
        const dbOptions = {
            useNewUrlParser: true,
            autoIndex: false,
            useUnifiedTopology: true,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        };
        mongoose.connect(url, dbOptions);
        mongoose.set('useFindAndModify', false);
        mongoose.Promise = global.Promise;
    }
};
