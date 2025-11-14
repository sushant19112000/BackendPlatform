var express = require('express');
const { getPacingReport, deletePacingReport } = require('../services/reportsService/pacingReportService');
var router = express.Router();


router.get('/all',async(req,res)=>{
    try{
         const pacings=await getPacingReport("ALL");
         return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }

})


router.get('/completed',async(req,res)=>{
    try{
         const pacings=await getPacingReport("COMPLETED");
         return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }
})

router.get('/paused',async(req,res)=>{
    try{
         const pacings=await getPacingReport("PAUSED");
         return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }
})

router.get('/overdue',async(req,res)=>{
    try{
         const pacings=await getPacingReport("OVERDUE");
         return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }
})


router.post('/',async(req,res)=>{
    try{

    }
    catch(e){
        console.log(e);
    }
})

router.put('/',async(req,res)=>{
    try{
   
    }
    catch(e){
        console.log(e);
    }
})

router.delete('/:id',async(req,res)=>{
    try{
        const pacingReportId = Number(req.params.id);
        const deletedPacing= await deletePacingReport()
    }
    catch(e){
        console.log(e);
    }
})

module.exports = router;