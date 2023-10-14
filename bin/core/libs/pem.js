import crypto from 'crypto';
import CryptoJS from "crypto-js";
export default (env) => ({
    encrText: (data) => {
        return CryptoJS.AES.encrypt(data, process.env.CRYPTO_SECRET).toString()
    },
    descText: (text) => {
        var bytes = CryptoJS.AES.decrypt(text, process.env.CRYPTO_SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    },
    generate: async function() {


        return await new Promise(async (resolve, reject) =>{

            crypto.generateKeyPair('rsa',
            {
                modulusLength:process.env.MODULUSLENGTH|| 4096,
                publicKeyEncoding:{
                    type:'spki',
                    format:'pem'
                },
                privateKeyEncoding:{
                    type:'pkcs8',
                    format:'pem',
                }
            
               }
            ,(err,publickey,privateKey)=>{
                if (err) return  reject(err)
                resolve({
                    publickey,
                    privateKey,
                    publickey_hash:this.encrText(publickey)
                    ,privateKey_hash:this.encrText(privateKey)
                });

            })
    
            
    
            })
        }




})