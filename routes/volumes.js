var express = require('express');
const { getVolumesByCampaignId } = require('../services/leadService/volumes');
const prisma = require('../db/dbConnection');
var router = express.Router();


router.get('/campaign/:id',async(req,res)=>{
    try{  
        const campaignId = Number(req.params.id);
        const status= req.query.status || "all"
        const volumes=await getVolumesByCampaignId(campaignId,status);
        console.log(volumes)
        return res.status(200).json({ message: "Data fetched successfully", data:volumes });
    }
    catch(e){
        console.log(e);
    }
})

router.put('/:id',async(req,res)=>{
    try{  
        const id = Number(req.params.id);
        const data=req.body;
        const vExists=await prisma.volume.findFirst({where:{id:id}});
        if(!vExists){
            return res.status(404).json({message:"Volume Not found"})
        }



        console.log(req.body,"in api")
        await prisma.volume.update({where:{id:id},data:data})
     
        return res.status(200).json({ message: "Data Updated successfully" });
    }
    catch(e){
        console.log(e);
    }
})



// Update an existing client
router.put('/:id/unassigned', async (req, res) => {
    try {
        const volumeId = Number(req.params.id);
        if (isNaN(volumeId)) return res.status(400).json({ message: "Invalid Volume ID" });

        const vExists= await prisma.volume.findFirst({where:{id:volumeId}})
        const vP=req.body.validationProfile;

        if (!vExists) return res.status(404).json({ message: "Volume not found or update failed" });
        const updateVolume= await prisma.volume.update({where:{id:volumeId},data:{validationProfile:vP}})
        res.status(200).json({ message: "Volume updated successfully", data: updateVolume });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update an existing client
router.put('/:id/validation/internal-rules', async (req, res) => {
    try {
        const volumeId = Number(req.params.id);
        if (isNaN(volumeId)) return res.status(400).json({ message: "Invalid Volume ID" });

        const vExists= await prisma.volume.findFirst({where:{id:volumeId}})
        const lt=req.body;
    
        if (!vExists) return res.status(404).json({ message: "Volume not found or update failed" });
        const updateVolume= await prisma.volume.update({where:{id:volumeId},data:{leadTemplate:lt}})
        res.status(200).json({ message: "Volume updated successfully", data: updateVolume });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Update an existing client
router.put('/:id/validation/external-rules', async (req, res) => {
    try {
        const volumeId = Number(req.params.id);
        if (isNaN(volumeId)) return res.status(400).json({ message: "Invalid Volume ID" });

        const vExists= await prisma.volume.findFirst({where:{id:volumeId}})
        const externalRules=req.body;
    
        if (!vExists) return res.status(404).json({ message: "Volume not found or update failed" });
        const updateVolume= await prisma.volume.update({where:{id:volumeId},data:{externalRules:externalRules}})
        res.status(200).json({ message: "Volume updated successfully", data: updateVolume });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update an existing client
router.put('/:id/assigned', async (req, res) => {
    try {
        const volumeId = Number(req.params.id);
        if (isNaN(volumeId)) return res.status(400).json({ message: "Invalid Volume ID" });

        const vExists= await prisma.volume.findFirst({where:{id:volumeId}})
        const lt=JSON.stringify(req.body);
    
        if (!vExists) return res.status(404).json({ message: "Volume not found or update failed" });
        const updateVolume= await prisma.volume.update({where:{id:volumeId},data:{leadTemplate:lt}})
        res.status(200).json({ message: "Volume updated successfully", data: updateVolume });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.get('/available-validations', async (req, res) => {
    try {  
        const campaignId = Number(req.query.campaignId);
        const pacingId = Number(req.query.pacingId);

        const pacing = await prisma.pacing.findFirst({
            where: { id: pacingId },
            include: { volume: true }
        });

        let unassignedProfileFlag = false;
        let assignedProfileFlag = false;
        let headers={};
        
        if (pacing.volume.validationProfile && Object.keys(pacing.volume.validationProfile).length > 0) {
            unassignedProfileFlag = true;
        }

        if (pacing.volume.leadTemplate !== null && pacing.volume.leadTemplate !== "template") {
          
            assignedProfileFlag = true;
        }

       

        return res.status(200).json({
            message: "Data fetched successfully",
            data: { volumeName:pacing.volume.name,pacingDate:pacing.scheduledFor,assignedProfileFlag, unassignedProfileFlag,headers }
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Something went wrong", error: e.message });
    }
});

module.exports = router;