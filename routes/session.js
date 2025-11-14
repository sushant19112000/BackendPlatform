var express = require('express');
const prisma = require('../db/dbConnection');
const { createSession } = require('../services/tasks/sessions');
var router = express.Router();



router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const taskId = data.taskId;
        const userId = data.userId;
        const type="TASK"
        const newSession= await createSession(userId, type, taskId)
        return res.status(200).json({ sessionId: newSession.id });
          
    }
    catch (e) {
        return res.status(500).json({message:"Failed to add session data"});

        console.log(e);
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