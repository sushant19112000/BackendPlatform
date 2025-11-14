const prisma = require('../../db/dbConnection')

const getUsers=async()=>{
    try{
        const users= await prisma.user.findMany();
        return users;
    }
    catch(e){
        console.log(e);
    }
}

module.exports={getUsers};