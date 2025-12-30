var express = require('express');
const { getUploadsByPacingId } = require('../services/leadService/leadUpload');

var router = express.Router();

router.get('/pacing/:id',async(req,res)=>{
    try{  
        const pacingId = Number(req.params.id);
        const uploads=await getUploadsByPacingId(pacingId);
        return res.status(200).json({ message: "Data fetched successfully", uploads });
    }
    catch(e){
        console.log(e);
    }
})

module.exports = router;