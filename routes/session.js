var express = require('express');
const prisma = require('../db/dbConnection');
const { createSession, endSession } = require('../services/tasks/sessions');
var router = express.Router();



router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const date= new Date(data.date)
        const taskId = Number(data.taskId);
        const userId = Number(data.userId);
        const startTime= data.startTime;

        console.log(data,'session')
        const type="TASK"
        const newSession= await createSession(userId, type, taskId,date,startTime)
        return res.status(200).json({ sessionId: newSession.id });
          
    }
    catch (e) {
        return res.status(500).json({message:"Failed to add session data"});

        console.log(e);
    }

})



router.put('/:id', async (req, res) => {
    try {
        const data = req.body;
        const sessionId= Number(req.params.id)
        const endTime= data.endTime;
        const sessionEnd= await endSession(sessionId, endTime)
        return res.status(200).json({ message:"Session ended",session: sessionEnd });
          
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({message:"Failed to add session data"});

        
    }

})
router.post('/session-activity', async (req, res) => {
    try {
        const data = req.body;
        const end= req.query.end || "false";
        const userId = data.userId;
        const type="TASK"
         
        return res.status(200).json({ sessionId: newSession.id });
          
    }
    catch (e) {
        return res.status(500).json({message:"Failed to add session data"});

        console.log(e);
    }

})


router.get('/',async(req,res)=>{
    try{
        const log= req.query.log || "false";
        const id= req.query.id || -1;
        const end= req.query.end || 'false';
        if(log=="true" && id!=-1){
            console.log('session logged with id',id)
        }
        if(end=="true" && id!=-1){
             console.log('session ended with id',id)
        }
    }
    catch(e){
        console.log(e)
        return res.status(500).json({message:"Failed to fetch session data"})
    }
})

module.exports=router;