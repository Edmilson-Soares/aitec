export default {
    generator: function* generator(array) {
        for (let index = 0; index < array.length; index++) {
            yield array[index];

        }
    },
    generator_fn: function* generator(data) {
        if (Array.isArray(data)) {
            for (let index = 0; index < data.length; index++) {
                yield { data: data[index], index };

            }
        } else {
            data = Object.entries(data)

            for (let index = 0; index < data.length; index++) {
                yield { data: data[index][1], name: data[index][0] };

            }
        }

    },

    generate: async function(data, fn, ops, fun_error) {
        let flag = false;
        const fn_g = this.generator_fn(data)
        while (!flag) {
            const { value, done } = fn_g.next()
            if (value) {

                try {
                    await fn(value.data, {...ops, index: value.index, name: value.name })
                } catch (error) {
                    try {
                        await fun_error(error)
                    } catch (error) {

                    }

                }

            }
            flag = done
        }
    },
    command: async function(data, fn, ops, undo=()=>{},complite=()=>{},err) {
        let flag = false;
        let output=null
        let outputs=[]
        const fn_g = this.generator_fn(data)
        while (!flag) {
            let { value, done } = fn_g.next()
            if (value) {

                try {
                output=    await fn(value.data, {...ops,output, index: value.index, name: value.name })
                outputs.push({
                    state:true,
                    input:value.data,
                    output:output
                })
            
            } catch (error) {

                console.log(error)

                //console.log(ops)
        
                    done=true
                    try {
                       await undo(output,outputs,ops)
                    } catch (error) {
                        console.log(error)

                    }

                    await err(ops)

                }

            }else{
                complite(output,outputs)
            }
            flag = done
        }
    },
    undo: async function(data, fn, ops,complite) {
        console.log('undo')
        let flag = false;
        let output=null
        let outputs=[]
        const fn_g = this.generator_fn(data)
        while (!flag) {
            const { value, done } = fn_g.next()
            if (value) {

                try {
                output=    await fn(value.data,outputs, {...ops,output, index: value.index, name: value.name })
                outputs.push({
                    state:true,
                    input:value.data,
                    output:output
                })
            
            } catch (error) {
              
                    outputs.push({
                        state:false,
                        error:error.message,
                        input:value.data
                    })
                    try {
                    } catch (error) {

                    }

                }

            }else{
                complite(output,outputs)
            }
            flag = done
        }
    }

}