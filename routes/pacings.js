var express = require('express');
const { getAllPacings, getCampaignPacings, createPacing, getPacing, deletePacing, editPacing, getPacingsByCampaignIdAndVolumeName, getPacingsByVolumeId, getPacingsByVolumeIdAndStatus } = require('../services/leadService/pacings');
var router = express.Router();


router.get('/',async(req,res)=>{
    try{
           const pacings=await getAllPacings()
           return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }
})

router.get('/campaign/:id',async(req,res)=>{
    try{  
           const campaignId = Number(req.params.id);
           const pacings=await getCampaignPacings(campaignId)
           return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }
})

router.get('/volume/:id',async(req,res)=>{
    try{   
        
           const volumeId = Number(req.params.id);
           const status=req.query.status || "all"
          
           const volumePacings=await getPacingsByVolumeIdAndStatus(volumeId,status);
          
           return res.status(200).json({ message: "Data fetched successfully", data: volumePacings });
    }
    catch(e){
        console.log(e);
    }
})

router.get('/:id',async(req,res)=>{
    try{  
           const pacingId = Number(req.params.id);
           const pacings=await getPacing(pacingId)
           return res.status(200).json({ message: "Data fetched successfully", data: pacings });
    }
    catch(e){
        console.log(e);
    }
})


router.post('/',async(req,res)=>{
    try{
         const data=req.json();
         const newPacing=await createPacing(data)
         return res.status(201).json({ message: "Data fetched successfully", data: newPacing });
    }
    catch(e){
        console.log(e);
    }
})

router.put('/:id',async(req,res)=>{
    try{
     const data=req.json();
     const pacingId = Number(req.params.id);
     const updatedPacing= await editPacing(id,data)
     return res.status(201).json({ message: "Data Updated successfully", data: updatedPacing });
     
    }
    catch(e){
        console.log(e);
    }
})


router.delete('/:id',async()=>{
    try{
        const pacingId = Number(req.params.id);
        const pacing=await deletePacing(pacingId)
        return res.status(201).json({ message: "Data Deleted successfully" });
    }
    catch(e){
        console.log(e);
    }
})


module.exports = router;