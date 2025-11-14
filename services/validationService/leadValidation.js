var validator = require('validator');

const v1=async()=>{
    try{
       const errors={};
       const l1={email:"sushant.chougule@gmail.com",firstName:"Sushant"}
       if(!validator.isEmail(l1.email)){
        errors.email="invalid email";
       }

       
       
       

       return !errors.length>0;
    }
    catch(e){
        console.log(e)
    }
}



const validate=async()=>{
    try{
        
        console.log('validate')
    }
    catch(e){
        console.log(e)
    }
}










