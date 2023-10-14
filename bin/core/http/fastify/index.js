
import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);


export default async(obj)=>{

    return {
        start(){
            server.listen(process.env.PORT|| 3000, () => {
                console.log('listening on *:'+(process.env.PORT|| 3000));
           });
        }
    }

}