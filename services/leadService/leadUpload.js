const prisma = require('../../db/dbConnection')


const getUploadsByPacingId=async(pacingId)=>{
    try{
       const uploads= await prisma.leadsUpload.findMany({where:{pacingId:pacingId},include:{uploader:true}})
       return uploads
    }
    catch(e){
        console.log(e);
    }
}


module.exports={getUploadsByPacingId}