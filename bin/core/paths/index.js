
import forawait from './../forawait.js'

import fs from 'node:fs'

const paths_={}

const path_route=({path,path_})=>{
    if(path.includes('.')){
       return path.includes('.')[0]
    }else{
      return  fs.readdirSync(path_+'/'+path)
    }
}

const v=async(paths_,file,__path)=>{
    const route={}
    await forawait.generate(paths_,async (path)=>{
        const p_= path_route({path,path_:(file+'/'+__path)})
         if(!Array.isArray(p_)){
             route[path.split('.')[0]]=path
         }else{
            const f=await v(p_,file,__path+'/'+path)
             route[path.split('.')[0]]=f
         }
     },{},console.log)

     return route
}


const  getPaths=async(path_)=>{
          
    const paths=fs.readdirSync(path_)
    await forawait.generate(paths,async (path)=>{
    const p_= path_route({path,path_})
        if(!Array.isArray(p_)){
            paths_[path.split('.')[0]]=path
        }else{
            const f=await v(p_,path_,path)
            paths_[path.split('.')[0]]=f
        }
    },{},console.log)

    return paths_

}

export {
    getPaths,
    fs

}


