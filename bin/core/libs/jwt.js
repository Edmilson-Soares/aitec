import jwt from 'jsonwebtoken';
import CryptoJS from "crypto-js";
export default (env) => ({
    encrText: (data) => {
        return CryptoJS.AES.encrypt(data, process.env.CRYPTO_SECRET).toString()
    },
    descText: (text) => {
        var bytes = CryptoJS.AES.decrypt(text, process.env.CRYPTO_SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    },
    token: async function(data) {
        try {
            data[process.env.APP_NAME||'aitec'] = CryptoJS.AES.encrypt(process.env.CRYPTO_NAME, process.env.CRYPTO_SECRET).toString()
            let token = await jwt.sign(data, this.descText(process.env.PRIVATE_KEY), { algorithm: 'RS256',expiresIn:process.env.TIME_JWT||'24h' });
            return token;
        } catch (error) {
            console.log(error)
        }
    
    },
    verify: function(token) {
        try {
            let decoded = jwt.verify(token, this.descText(process.env.PUBLIC_KEY));
            let bytes = CryptoJS.AES.decrypt(decoded[process.env.APP_NAME||'aitec'], process.env.CRYPTO_SECRET);
            if (!(bytes != process.env.CRYPTO_NAME)) throw new Error('jwt não é do '+process.env.APP_NAME||'aitec')
            return decoded;
        } catch (err) {
            console.log(err)
                // err
            return err
        }
    },

})