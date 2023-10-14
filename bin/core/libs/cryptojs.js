import CryptoJS from "crypto-js";

/***
import CryptoJS from "crypto-js";

var data = "[{ id: 1 }, { id: 2 }]"

// Encrypt
var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret key 123').toString();

// Decrypt
var bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

//console.log(decryptedData, bytes.toString(CryptoJS.enc.Utf8), ciphertext); // [{id: 1}, {id: 2}]

console.log(bytes.toString(CryptoJS.enc.Utf8), ciphertext); // [{id: 1}, {id: 2}]

*/
export default () => CryptoJS