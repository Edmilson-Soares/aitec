
import forawait from './forawait.js'
//fs.readdirSync



export default ({files})=>{
    let package_ = files.JSON('package.json')
    let setting = {

        "plugins":{
            "files":{
            "entities":"",
            "libs":"",
            "modules":"",
            "middlewares":"",
            "routers":"",
            "sockets":"",
            "commands":"",
            "events":"",
            "services":""
      
            }
            
      
        },
        "grpc":{
            "servers":{
   
      
            }
      
        }
      }

    if(files.exists('/src/setting.json')){
        setting = files.JSON('src/setting.json')
     }
     

 

    return {
        forawait,

        executeCommand:({services,execute,undo})=>({
            async execute(data,ops,tasks){

        
        
                await forawait.command(tasks, async(task,{output})=>{

    
                    if(task.input=='data') return services.service(task.service).execute(data)
            
                    if(output?.state)  return services.service(task.service).execute(output)
        
                    return services.service(task.service).execute(task.input)
        
                },{data,ops,tasks},this.undo,execute,(_ops)=>{   
                    console.log(_ops)
                })
            
        
            },
           async undo(output,tasks,{data}){
                await forawait.undo(tasks||[], async(task,{output})=>{
                    if(task.input.input=='data') return services.service('app::'+task.input.service_undo).execute(data)
                    if(task.input.output?.state)  return services.service('app::'+task.input.service_undo).execute(output)
                    return services.service('app::'+task.input.service_undo).execute(output)
                
                }, {},undo)
            }
        
        }),

        async httpCore({events=[],libs,middlewares}){

            const _file=!files.exists('/bin')

           if(package_.dependencies['express']&&package_.dependencies['fastify']) {
                if(process.env.SERVER) {
                    if(package_.dependencies[process.env.SERVER]) return await  files.import(_file?'/node_modules/aitec/bin/core/http/express/index.js':'/bin/core/http/express/index.js',{
                        http:setting.http,
                        package_,
                        forawait,
                        files,
                        middlewares,
                        libs,
                        events:events.filter(event=>event.type.includes('infra::socket'))
        
                    })
                }
           }


            if(package_.dependencies['express']) return await  files.import(_file?'/node_modules/aitec/bin/core/http/express/index.js':'/bin/core/http/express/index.js',{
                http:setting.http,
                package_,
                forawait,
                files,
                middlewares,
                libs,
                events:events.filter(event=>event.type.includes('infra::socket'))

            })
        
            if(package_.dependencies['fastify']) return await  files.import((_file?'/node_modules/aitec/bin/core/http/fastify/index.js':'/bin/core/http/fastify/index.js'),{
                http:setting.http,
                package_,
                forawait,
                middlewares,
                libs,
                events:events.filter(event=>event.type.includes('infra::socket')),
                files,

            })
            

        },
        async libsCore(file_,obj,file){
            return {
                name:file_.split('.js')[0],
                lib:await  files.import((setting.plugins.files.libs||'/src/core/libs')+'/'+file_,obj)
            }
        },
        async libsCoreSystem(file_,obj,file){
            
            const _file=!files.exists('/bin')
            return {
                name:file_.split('.js')[0],
                lib:await  files.import(file||(_file?'/node_modules/aitec/bin/core/libs/':'/bin/core/libs/')+file_,obj)
            }
        },
        async moduleCore(path,file_,obj,file){
          //  protoLoader,path,fileModule,grpc
         if(!package_.dependencies['@grpc/proto-loader'] && !package_.dependencies['@grpc/grpc-js']) return  null
        const grpc =await import('@grpc/grpc-js');
        const protoLoader =await import('@grpc/proto-loader');

        const _file=!files.exists('/bin')

            return {
                name:'module::'+path,
                module:await  files.import((_file?'/node_modules/aitec/bin/core/module/index.js':'/bin/core/module/index.js'),{
                    path,
                    files,
                   async getgrpc(obj){
                        return await files.import(file|| (_file?'/node_modules/aitec/bin/core/module/grpc.js':'/bin/core/module/grpc.js'),obj)
                    },
                    ...obj,
                    forawait,
                    setting:setting.grpc,
                    protoLoader,
                    grpc
                })
            }
        },

        async dbCore(path,file_,obj,file){
            const _file=!files.exists('/bin')
            return {
                name:'infra::'+path+'.'+file_.split('.js')[0],
                db:await  files.import(file||(_file?'/node_modules/aitec/bin/core/db':'/bin/core/db')+'/'+path+'/'+file_,obj)
            }
        },
        async loadDbs(obj,path){
            const Dbs={}
            const _file=!files.exists('/bin')
            
            await forawait.generate(files.paths(path||(_file?'/node_modules/aitec/bin/core/db':'/bin/core/db')),async(path_)=>{
                await forawait.generate(files.paths((path||(_file?'/node_modules/aitec/bin/core/db':'/bin/core/db'))+'/'+path_),async(file_)=>{
                    const {name,db}=await this.dbCore(path_,file_,obj)
                    Dbs[name]= db
                 },{},console.log)

            },{},console.log)
            return Dbs
        },

        async entityCore(path,file_,obj,file){
            return {
                name:'core::'+path+'.'+file_.split('.js')[0],
                entity:await  files.import((setting.plugins.files.entities||'/src/core/entities')+'/'+path+'/'+file_,obj)
            }
        },
        async routerCore(path,file_,obj,file){
            return await  files.import((setting.plugins.files.routers||'/src/infra/routers')+'/'+path+'/'+file_,obj)
        },
        async serviceCore(path,file_,obj,file){
            return {
                name:'app::'+path+'.'+file_.split('.js')[0],
                service:await  files.import((setting.plugins.files.services||'/src/app/services')+'/'+path+'/'+file_,obj)
            }
        },
        async middlewareCore(path,file_,obj,file){
            return {
                name:'infra::'+path+'.'+file_.split('.js')[0],
                middleware:await  files.import((setting.plugins.files.middlewares||'/src/infra/middlewares')+'/'+path+'/'+file_,obj)
            }
        },
        async jobCore(file_,obj,file){
            return {
                name:file_.split('.js')[0],
                job:await  files.import(file||'/src/infra/jobs/'+file_,obj)
            }
        },
        async loadJobs(obj,file){
            const jobs={}
            await forawait.generate(files.paths(file||'/src/infra/jobs'),async(file_)=>{
               const {name,job}=await this.jobCore(file_,obj)
               jobs[name]=job
            },{},console.log)
            return jobs
        },
        async eventsCore(path,file_,obj,file){
            return {
                name:'app::'+path+'.'+file_.split('.js')[0],
                event:await  files.import((setting.plugins.files.events||'/src/app/events')+'/'+path+'/'+file_,obj)
            }
        },
        async loadEvents(obj,path){
            const Events={}
            if(!files.exists(setting.plugins.files.events||'/src/app/events')){
                return   Events
             }
            await forawait.generate(files.paths(setting.plugins.files.events||'/src/app/events'),async(path_)=>{
                await forawait.generate(files.paths((setting.plugins.files.events||'/src/app/events')+'/'+path_),async(file_)=>{
                    const {name,event}=await this.eventsCore(path_,file_,obj)
                    Events[name]= event
                    Events[name].ops.name=Events[name].name||name
                    Events[name].name=Events[name].name||name
                 },{},console.log)

            },{},console.log)
            return Events
        },
        async commandCore(path,file_,obj,file){
            return {
                name:'app::'+path+'.'+file_.split('.js')[0],
                command:await  files.import((setting.plugins.files.commands||'/src/app/commands')+'/'+path+'/'+file_,obj)
            }
        },
        async loadCommands(obj,path){


            const Commands={}
            if(!files.exists(setting.plugins.files.commands||'/src/app/commands')){
                return   Commands
             }
            await forawait.generate(files.paths(setting.plugins.files.commands||'/src/app/commands'),async(path_)=>{
                await forawait.generate(files.paths((setting.plugins.files.commands||'/src/app/commands')+'/'+path_),async(file_)=>{
                    const {name,command}=await this.commandCore(path_,file_,obj)
                    Commands[name]= command
                 },{},console.log)

            },{},console.log)
            return Commands
        },
        async loadModules(obj,file){
            const { Subject } = obj.libs.rxjs
            const rx = new Subject()
            const Modules={}
            if(!package_.dependencies['@grpc/grpc-js']) return  null
   

            await forawait.generate(files.paths(setting.plugins.files.modules||'/src/modules'),async(path_)=>{

                const {name,module}=await this.moduleCore(path_,'d',{...obj,rx})
                Modules[name]=module
                Modules[name].rx=rx
                await Modules[name].start()
            

            },{},console.log)
            return Modules
        },
       async loadLibs(obj,file){
            const libs={}

            if(!files.exists(setting.plugins.files.libs||'/src/core/libs')){
                return libs
             }
            await forawait.generate(files.paths(setting.plugins.files.libs||'/src/core/libs'),async(file_)=>{
               const {name,lib}=await this.libsCore(file_,obj)
               libs[name]=lib
            },{},console.log)
            
            return libs
        },
        async loadLibsSystem(obj,file){

            const _file=!files.exists('/bin')
            const libs={}
            await forawait.generate(files.paths(file||(_file?'/node_modules/aitec/bin/core/libs':'/bin/core/libs')),async(file_)=>{
               const {name,lib}=await this.libsCoreSystem(file_,obj)
               libs[name]=lib
            },{},console.log)
            return libs
        },
        async loadEntities(obj,path){
            const Entities={}
            if(!files.exists(setting.plugins.files.entities||'/src/core/entities')){
                return  Entities
             }
            await forawait.generate(files.paths(setting.plugins.files.entities||'/src/core/entities'),async(path_)=>{
                await forawait.generate(files.paths((setting.plugins.files.entities||'/src/core/entities')+'/'+path_),async(file_)=>{
                    const {name,entity}=await this.entityCore(path_,file_,obj)
                    Entities[name]=entity
                 },{},console.log)

            },{},console.log)
            return Entities
        },
        async loadServices({libs,module,commands,db,dbs,entities},path){
            const Services={}
            if(!files.exists(setting.plugins.files.services||'/src/app/services')){
                return  Services
             }
            const { Subject } = libs.rxjs
            const rx = new Subject()
         
            await forawait.generate(files.paths(setting.plugins.files.services||'/src/app/services'),async(path_)=>{
                await forawait.generate(files.paths((setting.plugins.files.services||'/src/app/services')+'/'+path_),async(file_)=>{
                    const {name,service}=await this.serviceCore(path_,file_,{module,commands,libs,rx,db,dbs,entities})
                    Services[name]= service
                    Services[name].rx = rx
                 },{},console.log)

            },{},console.log)
            return Services
        },
        async loadMiddlewares({libs,module,services,db},path){
           
            const Middlewares={}
            if(!files.exists(setting.plugins.files.middlewares||'/src/infra/middlewares')){
                return  Middlewares
             }
            await forawait.generate(files.paths(setting.plugins.files.middlewares||'/src/infra/middlewares'),async(path_)=>{
                await forawait.generate(files.paths((setting.plugins.files.middlewares||'/src/infra/middlewares')+'/'+path_),async(file_)=>{
                    const {name,middleware}=await this.middlewareCore(path_,file_,{libs,module,services,db})
                    Middlewares[name]= middleware
                 },{},console.log)
            },{},console.log)
            return Middlewares
        },
        async loadRouters(obj,http,path){

            if(!files.exists(setting.plugins.files.routers||'/src/infra/routers')){
                return   null
             }
           
            await forawait.generate(files.paths(setting.plugins.files.routers||'/src/infra/routers'),async(path_)=>{
                
                await forawait.generate(files.paths((setting.plugins.files.routers||'/src/infra/routers')+'/'+path_),async(file_)=>{
                   const {route}=await this.routerCore(path_,file_,obj)
                   http.register(route)
                 },{},console.log)

            },{},console.log)
            
        }
    }
}