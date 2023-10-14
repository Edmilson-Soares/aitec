
export default ({services,libs}) =>({

    roles(roles){

        return {
           async auth({jwt}){

            if(roles.length==0) return {auth:true,user:{}}

            try {
              const user=await libs.jwt.verify(jwt)
              const role=  roles.find(role=>role==user.role)
 
              if(role) return {
                 auth:true,
                 user
              }

              return {auth:false,user}
 
            } catch (error) {
                return {auth:false,user:{}}
            }

 
    
            }
        }



    }
})