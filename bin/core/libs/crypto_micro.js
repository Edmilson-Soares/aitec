import CryptoJS from "crypto-js";

export default () => ({
    desc: (data) => {
        return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.CRYPTO_SECRET).toString()
    },
    encrText: (data) => {
        console.log(data)
        return CryptoJS.AES.encrypt(data, process.env.CRYPTO_SECRET).toString()
    },
    encr: (text) => {
        var bytes = CryptoJS.AES.decrypt(text, process.env.CRYPTO_SECRET);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    },
    descText: (text) => {
        var bytes = CryptoJS.AES.decrypt(text, process.env.CRYPTO_SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
})