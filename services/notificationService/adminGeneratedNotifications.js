const prisma = require('../../db/dbConnection')


const createNotification=async(message,notificationPriorityId,notificationSubscriberId)=>{
    try{
       const newNotification=await prisma.notification.create({
             data:{
                message,
                notificationPriorityId,
                notificationSubscriberId
             }
       })
       return newNotification;
    }
    catch(e){
        console.log(e)
    }
}


