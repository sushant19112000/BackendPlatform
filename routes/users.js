var express = require('express');
const { getUsers } = require('../services/users/usersCrud');
var router = express.Router();


router.get('/',async(req,res)=>{
    try{
        const users=await getUsers();

        res.status(200).json([...users]);
    }
    catch(e){
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
})


module.exports = router;