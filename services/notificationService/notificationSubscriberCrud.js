const prisma = require('../../db/dbConnection')



const getNotificationSubGroupNames = async () => {
    try {
        const subGroups = await prisma.notificationSubscriberGroup.findMany();
        return subGroups;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}


const addNotificationSubGroup = async (data) => {
    try {
        // data example 
        // { name:"",users:[userId1,userId2]}
        const notificationSubGroupExists = await prisma.notificationSubscriberGroup.findFirst({where:{name:data.name}});
        if (notificationSubGroupExists) {
            return false;
        }

        const newNotificationSubGroup = await prisma.notificationSubscriberGroup.create({
            data: {
                name: data.name
            },
        })


        for (let u of data.users) {
            let newSubscriberGroupUser= await prisma.subscriberGroupUser.create({
                data: {
                    userId: u,
                    subscriberGroupId: newNotificationSubGroup.id,
                }
            })
        }
        return true;
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = { getNotificationSubGroupNames, addNotificationSubGroup }