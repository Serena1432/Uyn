const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'qbjnHLx7QYKc7P3FBaCTxJ33BrmBaNrk';
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return iv.toString('hex') + "." + encrypted.toString('hex')
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.split(".")[0], 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.split(".")[1], 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encrypt,
    decrypt
};