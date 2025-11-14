const prisma = require('../../db/dbConnection')


const fetchFiles=async(campaignId)=>{
   try{
       const files=await prisma.campaignInfo.findFirst({where:{campaignId:campaignId},select:{filesInfo:true}})
       return files;
   }
   catch(e){
    console.log(e);
   }
}


module.exports=fetchFiles;