

import { expect, test } from 'vitest'
import auth_route from '../bin/core/http/utils/auth_route'
import jwt from 'jsonwebtoken';


const libs={
    jwt:{
        token: async(data) => {
            try {
                return jwt.sign(data, 'secret', { expiresIn: 60 * 60 });
            } catch (error) {
                console.log(error)
            }
    
        },
        verify:async (token) => {
            try {
              return  jwt.verify(token, 'secret');
            } catch (err) {
                // err
                return err
            }
        },
    }
}

const _jwt=await libs.jwt.token({
    role:'client'
})




test('test role on client', async() => {

const {auth,user}=await auth_route({libs}).roles(['client']).auth({name:'dddd',jwt:_jwt})
expect(user.role).toBe('client')
expect(auth).toBe(true)

})


const __jwt=await libs.jwt.token({
    role:'test'
})

test('test role no client', async() => {

    const {auth,user}=await auth_route({libs}).roles(['client']).auth({name:'dddd',jwt:__jwt})
    expect(user.role).toBe('test')
    expect(auth).toBe(false)
    
})


test('test role no client', async() => {

    const {auth,user}=await auth_route({libs}).roles(['client']).auth({name:'dddd',jwt:''})
    expect(user.role).toBeUndefined()
    expect(auth).toBe(false)
    
})