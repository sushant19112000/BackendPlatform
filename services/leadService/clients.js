const prisma = require('../../db/dbConnection')

const fetchAllClients = async () => {
    try {
        const clients = await prisma.client.findMany({ include: { campaigns: true } });
        return clients;
    }
    catch (e) {
        console.log(e)
    }
}


const fetchClient = async (id) => {
    try {

        const client = await prisma.client.findFirst({
            where: { id: id },
            include: {
                campaigns: {
                    select: {
                        id: true,
                        name: true, // include any other campaign fields you want
                        duedate:true,
                        updated_at:true,
                        leadgoal:true,
                        _count: {
                            select: { leads: true }
                        }
                    }
                }
            }
        });

        return client;
    }
    catch (e) {
        console.log(e)
    }
}

const addClient = async (data) => {
    try {
        const existingClient = await prisma.client.findFirst({ where: { name: data.name } });
        if (existingClient) return false;
        const newClient = await prisma.client.create({ data: data })
        return newClient;

    }
    catch (e) {
        console.log(e)
    }
}


const editClient = async (id, data) => {
    try {
        const existingClient = await prisma.client.findFirst({ where: { id: id } })
        if (!existingClient) return false;
        const editedClient = await prisma.client.update({ where: { id: id }, data: data })
        return true;
        console.log('edit client')
    }
    catch (e) {
        console.log(e)
    }
}

const deleteClient = async (clientId) => {
    try {

        const existingClient = await prisma.client.findFirst({ where: { id: clientId } })
        if (!existingClient) return false;
        const deletedClient = await prisma.client.delete({ where: { id: clientId } })
        return true

    }
    catch (e) {
        console.log(e);
    }
}



module.exports = { fetchAllClients, addClient, deleteClient, fetchClient, editClient };