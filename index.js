import coreSystem from "./bin/core/index.js";
import fs from 'fs'
import path from 'path'

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
  const testSystem={

  }

  const core=coreSystem({
    files,
})


testSystem.service=async({path,file,commands,module,db})=>{

  const libsCore=await core.loadLibsSystem({})
  const libs=await core.loadLibs({})
const entities = await core.loadEntities({...libsCore,...libs})
const { Subject } = libsCore.rxjs
const rx = new Subject()

const obj={
    entities:(name)=>{
            return entities[name]
    },
    libs:{...libsCore,...libs},
    module:module||{},
    commands:commands||{},
    db:db||{
        model:(name)=>{
            return {
                execute(name,obj){
                    return {}
                }
            }
        }
    },
    rx
}
const {service}=await core.serviceCore(path,file,obj)

return service

}


testSystem.entity=async({path,file})=>{

  const libsCore=await core.loadLibsSystem({})
  const libs=await core.loadLibs({})

const {entity}=await core.entityCore(path,file,{...libsCore,...libs})

return entity

}



export {core,testSystem}