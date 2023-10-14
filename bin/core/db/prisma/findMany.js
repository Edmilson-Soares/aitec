export default ({ libs }) => ({
    execute: async(model, data) => {
        return await libs('prisma')[model].findMany(data)
    }
})