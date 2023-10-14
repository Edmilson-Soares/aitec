import bcrypt from 'bcryptjs'


export default (env) => ({

    password(password) {
        return bcrypt.hashSync(password,process.env.SALT||10)
    },
    compare(password, hash) {
        return bcrypt.compareSync(password, hash)
    }


})