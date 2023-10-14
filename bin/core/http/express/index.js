
import express from 'express';
const app = express();
import http from 'http';
import utils from '../utils/index.js';
import auth_route from '../utils/auth_route.js';
import cookieParser from 'cookie-parser';

import cors from 'cors'

app.use(cookieParser());

const corsOptions = {
    origin:process.env.CORS|| '*',
    optionsSuccessStatus: 200
}


app.use(cors(corsOptions))

app.use(express.static('./public'))

app.use(express.json())

const server = http.createServer(app);
let io=null


export default async({package_,middlewares,libs,forawait,http,events=[],files,file})=>{

    const router = express.Router()
    const roles=auth_route({libs}).roles

    if(package_.dependencies["socket.io"])  {
        const { Server }= await  import("socket.io");
        io = new Server(server);   

        await forawait.generate(files.paths(file||'/src/infra/sockets'),async(file_)=>{

            const socket_app=  await  files.import(file||'/src/infra/sockets/'+file_,{
                forawait,
                events:events.filter(event=>event.ops.path.includes(file_.split('.js')[0]))
              })

            if(file_.includes('index')){
              io.on('connection',socket_app.connection);
            }else{
            io.of('/'+file_.split('.js')[0]).on('connection',socket_app.connection);
            }
    
         },{},console.log)


    }

    if(package_.dependencies['ejs'])  {
        app.set("view engine", "ejs");
        app.set('views',(http.ejs||'src/infra/views'));
    }

    return {
        io,
        register({method,req:req_,res:res_,type,page,auth:auth_=[],middlewares:middlewares_,path,controller}){
            
            
            const types={
                api({status,data},res){
                    if(res_[status].parse) return  res.status(status).send(res_[status].parse(data))
                     return   res.status(status).send(data)
                },
                view({status,data},res,page){
                    if(res_[status].parse)  return res.render(page,{
                        page:res_[status].parse(data)
                       })


                       return res.render(page,{
                        page:{
                            ...data,
                        }
                       })

                }
            }


            router[method?method.toLowerCase():'get'](type=='api'?'/api'+path:path,async(req,res,next)=>{
                const jwt=(req.headers.authorization?req.headers.authorization.split(' ')[1]:null)
                const {user,auth}=await roles(auth_).auth({
                    jwt:req.cookies[process.env.COOKIE_NAME+'_jwt']||jwt
                })


                if(!auth && type!='api') return res.redirect(process.env.REDIRECT_AUTH_URL)

                if(!auth && type=='api') return res.status(403).send({
                    error: 403,
                    message: 'não autorizado'
                })


                req.user=user
                if(req.body){
                    req.body={user}
                }

              return  await  next()

            },
            async(req,res,next)=>{
                req.obj={}
               
                if(method){
                    method='get'
                }
                if(method!=='get' || method!=='delete'){
                       if(req_.body?.parse){
                        try {
                            req.body= await req_.body.parse(req.body)
                            req.body.user=req.user
                        } catch (error) {
                            return res.status(400).send(error)
                        }
                       }
                }


                if(req_.query?.parse){
                    try {
                        req.query= await req_.query.parse(req.query)
                    
                    } catch (error) {
                        return res.status(400).send(error)
                    }
                   }


                   if(req_.params?.parse){
                    try {
                        req.params= await req_.params.parse(req.params)
                    } catch (error) {
                        return res.status(400).send(error)
                    }
                   }

                   if(req_.headers?.parse){
                    try {
                        req.headers= await req_.headers.parse(req.headers)
                    } catch (error) {
                        return res.status(400).send(error)
                    }
                   }

                   if(req_.cookies?.parse){
                    try {
                        req.cookies= await req_.cookies.parse(req.cookies)
                    } catch (error) {
                        return res.status(400).send(error)
                    }
                   }
           
              return  await  next()

            },
            async(req,res,next)=>{
                req.obj={}
                const {body,cookies,query,params}=req
                await forawait.generate(middlewares_,async(middleware)=>{
                    try {
                        if(!middlewares['infra::'+middleware]) return null

                     const {error,data,redirect,cookie,cookie_clear} =await  middlewares['infra::'+middleware].middleware({io,body,cookies,query,params})
                      
                      if(error) return  await  next(error)

                      if(redirect) return res.redirect(redirect)

                      if(cookie) return res.cookie(process.env.COOKIE_NAME + '_' + cookie.name, cookie.data, { httpOnly: true })

                      if(cookie_clear) return res.cookie(process.env.COOKIE_NAME + '_' + cookie.name,null, { httpOnly: true })

                      req.obj[middleware]=data

                    } catch (error) {
                        return  await  next(error)
                    }
                 },{},console.log)
           
              return  await  next()

            }
            
            ,async(req,res)=>{
                const {body,cookies,query,params,headers}=req
                 return types[type](await utils[type](controller,{io,body,cookies,headers,query,params,option:req.obj}),res,page)
            })

        },
        start(){

            app.use(router)
            app.use('/api/*', (req, res) => {
                res.status(404).send({
                    error: 404,
                    message: 'não encontrado'
                })
            })


            if(package_.dependencies['ejs'])  {
                app.use('*', (req, res) => {
                    res.render('errors/404')
                })
            }
            server.listen(process.env.PORT|| 3000, () => {
                console.log('listening on *:'+(process.env.PORT|| 3000));
           });
        }
    }

}