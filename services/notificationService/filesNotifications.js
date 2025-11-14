const prisma = require('../../db/dbConnection')



const fileAddedNotification=async(fileName,time,campaignCode)=>{
    try{
        const message=`${fileName} has been added to ${campaignCode} at ${time}`
        const newNotification= await prisma.notification.create({
              data:{
                notificationPriorityId:1,
                notificationSubscriberId:2,
                message:message,
            }
        })
        return newNotification;
    }
    catch(e){
        console.log(e);
    }
}


const fileRemovedNotification=async(fileName,time,campaignCode)=>{
    try{
        const message=`${fileName} has been removed from ${campaignCode} at ${time}`
        const newNotification= await prisma.notification.create({
            data:{
                notificationPriorityId:1,
                notificationSubscriberId:2,
                message:message,
            }
        })
        return newNotification;
    }
    catch(e){
        console.log(e)
    }
}



