const prisma = require('../../db/dbConnection');
const { createToken } = require('../../utils/tokenUtils');


const login=async(email,password)=>{
    try{ 

         const user= await prisma.user.findFirst({where:{email:email},include:{roles:true}});
         
         if(!user ) return false;
         if (user.password != password) return false;
         const token=createToken(user.id,user.email)

         let roleId=user.roles[0].roleId;
         let role= await prisma.role.findFirst({where:{id:roleId}}); 
         
         return {name:user.name,email:user.email,userId:user.id,token,role:role.name}
    }
    catch(e){
        console.log(e)
    }
}

// const addUser=async (email,name,password,roleName)=>{
//     try{
//         const role= await prisma.roles.findFirst
//     }
//     catch(e){
//         console.log(e);
//     }
// }

module.exports={login}