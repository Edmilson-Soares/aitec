export default ({ libs }) => ({
    execute: async() => {
        await libs('prisma').$disconnect()
    }
})