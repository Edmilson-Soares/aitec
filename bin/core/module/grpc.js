export default async({schema_file,forawait})=>{
    let service_grpc={}
    let services_grpc=schema_file.split('service')[1].split('message')[0]
    let messages_grpc=schema_file.split('service')[1].split('message').filter(m=>!m.includes('rpc'))
    
    
    services_grpc=services_grpc.split('rpc').filter(s=>s.includes('{}')).map(s=>{
        return s.split('{}')[0]
    })
    
    //console.log(services_grpc,messages_grpc)
    
    
    const grpc_type={}
    
    await forawait.generate(messages_grpc,async(message_grpc)=>{
    
    const name=message_grpc.replace('{','*').split('*')[0].trim()
    const obs=message_grpc.replace('{','*').split('*')[1].trim().split('}')[0].trim().split('=')
    
        grpc_type[name]=obs.map(m=>{
            return m.includes(`;\r\n`)? m.split(`;\r\n`).join().trim():m.trim()
        }).map(ob=>{
            if(ob.includes(';'))
              ob=ob.split(';')[0]
            if(ob.includes(','))
              ob=ob.split(',')[1].trim()
            return ob
        }).filter(ob=>{
            return isNaN(parseInt(ob))
        })
    
        await forawait.generate(grpc_type[name],(prop_grpc)=>{
        const [data,type]=prop_grpc.split(' ')
             if(Array.isArray(grpc_type[name])){
                grpc_type[name]={
                    [type]:data
                }
             }else{
                grpc_type[name][type]=data
             }
        
            },{},console.log)
    
    },{},console.log)
    
    
    //////////////////////////////////////////
    
    await forawait.generate(services_grpc,(service_grpc_)=>{
    
        const name=service_grpc_.replace('(','*').split('*')[0].trim()
    
        let [input,output]=service_grpc_.replace('(','*').split('*')[1].trim().split('returns')
        input=input.split(')')[0]
        output=output.split(')')[0].split('(')[1]
            
          service_grpc[name]={
            input:grpc_type[input],
            output:grpc_type[output],
        }
    
            },{},console.log)
    
    ////////////////////////////////////
    
        return {
            service:service_grpc,
            messages:grpc_type
        }
    }