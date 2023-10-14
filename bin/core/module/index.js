


export default ({setting,getgrpc,forawait,services,libs,files,fs,protoLoader,path,fileModule,grpc})=>({
  
    services:{},
    client:{},
    grpc:{},
    grpcOps:{
        
    },
    name_modulo:[],
    server_grpc:null,
   async getgrpc(file,name,path){


    this.grpcOps[path]={}
        const schema_file=files.read(file).toString()
      this.grpcOps[path][name]=await getgrpc({
            schema_file,
            forawait,
            name
        })
 
      this.grpcOps[path][name].services={}


        await forawait.generate(Object.entries(this.grpcOps[path][name].service), async([name_,service]) => {
         const name_service='app::'+name+'.'+name_
         this.grpcOps[path][name].services[name_]= async (call, callback) =>{
        
            try {
                const token =call.metadata.get('authorization')[0].split(' ')[1]
                console.log(token)
                if(!token) callback(new Error('Not authorization'));
               const token_desc= libs['crypto_micro'].descText(token)
               console.log(token_desc!=process.env.APP_TOKEN)
               if(!token_desc) callback(new Error('Not authorization'));
               if(token_desc!=process.env.APP_TOKEN) callback(new Error('Not authorization'));
               
                const data = await services.service(name_service).execute(call.request)
                if (data) {
                    callback(null, data);
                } else {
                    callback(new Error('Not found'));
                }
            

            } catch (error) {
                console.log(error)
                callback(new Error('Not authorization'));
            }
        }

          }, {})

          return this.grpcOps[path][name].services

    


    },
   async protoLoader(){
   

   await forawait.generate(files.paths('/src/modules/'+path+'/proto'), async(proto) => {

       const packageDefinition = protoLoader.loadSync(files.path+'/src/modules/'+path+'/proto/' + proto, {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        // The protoDescriptor object has the full package hierarchy
        const proto_ = protoDescriptor[proto.split('.proto')[0]];
  
        this.client[proto.split('.proto')[0]]={
            proto:proto_
        }

        const g=setting
    
      if(!g.servers[path]) return null

      this.server_grpc=new grpc.Server();
        const services= await this.getgrpc('/src/modules/'+path+'/proto/' + proto,proto.split('.proto')[0],path)
        this.server_grpc.addService(proto_.UserService.service, services);
    }, {},console.log)

    },
    async server(e,start){

        
        if(start==true){
            this.server_grpc.bindAsync(e, grpc.ServerCredentials.createInsecure(), () => {
             this.server_grpc.start();
                console.log('Server running at: ', e);
            });
        }
        this.grpc={} 
        await forawait.generate(Object.entries(this.client), async([name_,client]) => {
            this.grpc[name_]=  new client.proto.UserService(e, grpc.credentials.createInsecure());
        
        }, {},console.log)
       // console.log(this.grpc)
    },


   async start(){
    const grpc=setting
    await this.protoLoader(process.env[path+'_URL'])
    await this.server(process.env[path+'_URL'],grpc.servers[path])
    }

})