const {Server, Socket} = require("socket.io")
const prisma = require("../../db/dbConnection")

const setupSocket= (Server)=>{
    try{
    const io=new Server(Server,{
        cors:{
            origin:"*",
            methods:["GET","POST"]
        }
    });

    io.on("connection",(socket)=>{
        console.log('a user connected',socket.id);
        socket.on("joinRoom",async({conversationId})=>{
        })
    })

    }
    catch(e){
        console.log(e);
    }
}
