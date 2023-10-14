
import fs from 'fs';

import coreSystem from './core/index.js'
import path from 'path';


let init_function={
  
  register: async(system) => {


  },
  bootstrap: async(system) => {


  },
  distroy: async(system) => {

  }

}

const files={
  exists(path_){
    return fs.existsSync(path.resolve(this.path+path_))
  },
  JSON(file){
  const contant= fs.readFileSync(file);
    return JSON.parse(contant);
  },
  read(file){
     return fs.readFileSync(path.resolve(this.path+file));
    },
  path:process.cwd(),
  get(path_){
    return  path.resolve(this.path+path_)
  },
  async import(file,obj){
    return (await import ('file://'+this.get(file))).default(obj)
  },
   paths(path){
    return fs.readdirSync(this.get(path))
  }
}

if(files.exists('/src/index.js')){
   init_function = (await import('file://'+process.cwd()+'/src/index.js')).default
}



/////////////////

const crons={}


const core=coreSystem({
    files,
})

let package_ = files.JSON('package.json')

let amqplib=null
let amqplib_conn=null
let redis={}
let redis_client=null
let db=null;

if(package_.dependencies['amqplib']){
 amqplib= await import('amqplib');
  amqplib_conn =await (await amqplib.connect(process.env.RABBITMQ_URL)).createChannel();
}

if(package_.dependencies['redis']){

 const { createClient }= await import('redis');
 redis.createClient=createClient
 redis_client = createClient({
    url: process.env.REDIS_URL
  });
 await redis_client.connect();

 }

 if(package_.dependencies['@prisma/client']){
  const { PrismaClient }= await import('@prisma/client')
   db= new PrismaClient()

 }

const system={

   async register(name,obj){
     
    },
    async  start(){

      const events={
        'core::cron'(name, event){
          crons[name] = libs.cron({
            name,
            time: event.ops.time,
            state: event.ops.state,
            execute: event.handler
        })
      
        },
        'app::service'(name, event){
          services[name].rx.subscribe({
            next: event.handler,
        });
            
        },
        'infra::socket'(){
            
        },
       async 'infra::redis'(name,event){

          try {

            const redis_subscriber = libs.redis.duplicate();
            await redis_subscriber.connect();
            await redis_subscriber.subscribe(event.name,async(message)=>{
              event.handler(JSON.parse(message),message)
              });
            
        } catch (error) {
          // console.log(error,'dddd')
        }

            
        },
       async 'infra::rabbitmq'(name,event){
         // console.log(name,event,await amqplib_conn)

          const ch =amqplib_conn
          await ch.assertQueue(event.ops.queue)
          if (event.ops.exchangeName) {
  
              await ch.assertExchange(event.ops.exchangeName, event.ops.exchangeType)
              await ch.bindQueue(event.ops.queue, event.ops.exchangeName)

          }
          ch.consume(event.ops.queue, (message)=>{
            event.handler(JSON.parse(message.content.toString()),message,()=>{
              ch.ack(message)
            })
          })
           
        },
        'infra::job'(name,event){
            
        },
        'app::command'(name,event){
          commands[name].rx.subscribe({
            next: event.handler,
        });
        }
      }
      
      const libsSystem=   await core.loadLibsSystem(process.env)

      const libs= {forawait:core.forawait,...libsSystem,redis_client,redis,rabbitmq:amqplib_conn,amqplib,...(await core.loadLibs(process.env))}
      
      const entities=   await core.loadEntities(libs)
      const dbs=   await core.loadDbs({
        libs(name){
          const libs_={
              ...libs,
              prisma:db
            }
            return libs_[name]
          
        }
      })


      const services=   await core.loadServices({
          libs,
          io:()=>http.io,
          dbs:{
            db(name){
              return dbs[name]
            }
          },
          
          module:  function(name) {


            return {
              rx:modules[name].rx,
              async  execute(metudo,data,{rx}){

                
                  if(!package_.dependencies['@grpc/proto-loader'] && !package_.dependencies['@grpc/grpc-js']) return  null
                  const grpc =await import('@grpc/grpc-js');
                  const metadata = new grpc.Metadata();
                  const token=process.env.APP_SECRET
                  metadata.add('Authorization', `Bearer ${token}`);
      

                    if(!modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]]) throw Error('comunicao:errror:'+JSON.stringify({
                        name,
                        user:{},
                        metudo,
                        data
                    }))

                  
                return await (new Promise(async function(resolve, reject) {
                 await (modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]](
                    data,
                    metadata,
                    (err, response) => {
                      if (err) return  reject(err)
                      if(rx){
                        rx.next(response)
                      }
                      resolve(response);
                  }
                    ))
                  //(await module('module::user')).execute('user.index',data, )
              }))


             /////

                }
            }
         },
          db:{
            model(name){
              return dbs['infra::prisma.'+name.split('::')[1]]
            }
          },
          commands:{
           async command(name,{data,ops}){

            return await core.executeCommand({
                libs,
                io:()=>http.io,
                services:{
                  service(name){
                    return services[name]
                  }
                },
                undo:commands[name].undo,
                complite:commands[name].complite
              }).execute(data,ops,commands[name].tasks)

          
            }
          },
          entities:(name)=>({
            entity(data){
              return entities[name].entity(data)
            }
          })
        })


        try {

          libs.redis =redis.createClient({
              url:process.env.REDIS_URL
          })
          const redis_subscriber = libs.redis.duplicate();



          await redis_subscriber.connect();
  
          await redis_subscriber.subscribe('app',async (message) => {

              const input =JSON.parse(message)
          
              try {
                if(process.env.APP_NAME==input.name) return null
                 await modules['module::'+input.name].start()
              } catch (error) {
                 // console.log(error)
              }
          });

          const redis_publisher = libs.redis
          const app = {
              id:process.env.APP_ID,
              name:process.env.APP_NAME
            };
          
            await redis_publisher.connect();
          
            await redis_publisher.publish('app', JSON.stringify(app));
          
      } catch (error) {
        // console.log(error)
      }



      const events_=   await core.loadEvents({
        libs,
        rabbitmq:amqplib_conn,
        redis:redis_client,
        io:()=>http.io,
        module:  function(name) {


          return {
            async  execute(metudo,data,{rx}){

              
                if(!package_.dependencies['@grpc/proto-loader'] && !package_.dependencies['@grpc/grpc-js']) return  null
                const grpc =await import('@grpc/grpc-js');
                const metadata = new grpc.Metadata();
                const token=process.env.APP_SECRET
                metadata.add('Authorization', `Bearer ${token}`);
    

                  if(!modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]]) throw Error('comunicao:errror:'+JSON.stringify({
                      name,
                      user:{},
                      metudo,
                      data
                  }))

                
              return await (new Promise(async function(resolve, reject) {
               await (modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]](
                  data,
                  metadata,
                  (err, response) => {
                    if (err) return  reject(err)
                    if(rx){
                      rx.next(response)
                    }
                    resolve(response);
                }
                  ))
                //(await module('module::user')).execute('user.index',data, )
            }))


           /////

              }
          }
       },
        services:{
          service(name){
            return services[name]
          }
        },
        dbs:{
          db(name){
            return dbs[name]
          }
        },
        db:{
          model(name){
            return dbs[name]
          }
        }
      })

      await core.forawait.generate(Object.entries(events_),async([name,event])=>{

     
        if(!events[event.type]) return null
         events[event.type](name,event)


     },{},console.log)


    const commands=   await core.loadCommands({
        libs,
        io:()=>http.io,
        services:{
          service(name){
            return services[name]
          }
        },
        module:  function(name) {


          return {
            rx:modules[name].rx,
            async  execute(metudo,data,{rx}){

              
                if(!package_.dependencies['@grpc/proto-loader'] && !package_.dependencies['@grpc/grpc-js']) return  null
                const grpc =await import('@grpc/grpc-js');
                const metadata = new grpc.Metadata();
                const token=process.env.APP_SECRET
                metadata.add('Authorization', `Bearer ${token}`);
    

                  if(!modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]]) throw Error('comunicao:errror:'+JSON.stringify({
                      name,
                      user:{},
                      metudo,
                      data
                  }))

                
              return await (new Promise(async function(resolve, reject) {
               await (modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]](
                  data,
                  metadata,
                  (err, response) => {
                    if (err) return  reject(err)
                    if(rx){
                      rx.next(response)
                    }
                    resolve(response);
                }
                  ))
                //(await module('module::user')).execute('user.index',data, )
            }))


           /////

              }
          }
       },
        dbs:{
          db(name){
            return dbs[name]
          }
        },
        db:{
          model(name){
            return dbs[name]
          }
        },
        entities:{
          entity(name,data){
            return entities[name].entity(data)
          }
        }
    })




    const middlewares=   await core.loadMiddlewares({
      libs,
      io:()=>http.io,
      services:{
        service(name){
          return services[name]
        }
      },
  })

  const modules= await core.loadModules({
    libs,
    services:{
      service(name){
        return services[name]
      }
    },
  })
  

  const plugins={
    libs:{
      lib(name){
        return libs[name.split('core::libs.')[1]]
      }
    },
    services:{
      service(name){
        return services[name]
      }
    },
    commands:{
      async command(name,{data,ops}){

       return await core.executeCommand({
           libs,
           io:()=>http.io,
           services:{
             service(name){
               return services[name]
             }
           },
           undo:commands[name].undo,
           complite:commands[name].complite
         }).execute(data,ops,commands[name].tasks)

     
       }
     },
    jobs:{
      jobs(name){
        return jobs[name]
      }
    },
    dbs:{
      db(name){
        return dbs[name]
      }
    },
    modules:{
      module:  function(name) {


        return {
          rx:modules[name].rx,
          async  execute(metudo,data,{rx}){

            
              if(!package_.dependencies['@grpc/proto-loader'] && !package_.dependencies['@grpc/grpc-js']) return  null
              const grpc =await import('@grpc/grpc-js');
              const metadata = new grpc.Metadata();
              const token=process.env.APP_SECRET
              metadata.add('Authorization', `Bearer ${token}`);
  

                if(!modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]]) throw Error('comunicao:errror:'+JSON.stringify({
                    name,
                    user:{},
                    metudo,
                    data
                }))

              
            return await (new Promise(async function(resolve, reject) {
             await (modules[name].grpc[metudo.split('.')[0]][metudo.split('.')[1]](
                data,
                metadata,
                (err, response) => {
                  if (err) return  reject(err)
                  if(rx){
                    rx.next(response)
                  }
                  resolve(response);
              }
                ))
              //(await module('module::user')).execute('user.index',data, )
          }))


         /////

            }
        }
     },
    },

  }

    if(init_function.register){
          await init_function.register({ 
            env:process.env,
            plugins(name){
              return plugins[name]
            }
          })
      }
        ///////////////////////////////////////

 

        const http= await core.httpCore({
          libs,
          middlewares,
          events:Object.values(events_)||[]
        })

        await core.loadRouters({
          libs,
          dbs:{
            db(name){
              return dbs[name]
            }
          },
          redis:redis_client,
          db:{
            model(name){
              return dbs['infra::prisma.'+name.split('::')[1]]
            }
          },
          commands:{
            command(name){
              return commands[name]
            }
          },
          services:{
            service(name){
              return services[name]
            }
          },
          z:libs.z
        },http)

        try {
          await  http.start()
        } catch (error) {
          
        }

  

          ///////////////////////////////////////


 
       if(init_function.bootstrap){
            await init_function.bootstrap({
              env:process.env,
              http,
              plugins(name){
                return plugins[name]
              }
            })
        }


        

    },
   async stop(){
        if(init_function.stop){
            await init_function.stop()
        }
    }

}




export default system