var express = require('express');
const { login } = require('../services/authentication/users');
const prisma = require('../db/dbConnection');

var router = express.Router();

// router.post('/login',async(req,res)=>{
//     try{
//          const data=req.body;
//          const {email,password}= data;

//          console.log(data);
//          console.log(password,'in route');

//          const user=await login(email,password);


//          if (!user) return res.status(404).json({ message: "Invalid User Details"});

//          return res.status(201).json({...user  });
//     }
//     catch(e){
//         console.log(e);
//     }
// })

router.post('/login', async (req, res) => {
  try {
    const data = req.body;
    const { email, password } = data;

    const user = await login(email, password);

    if (!user) {
      return res.status(404).json({ message: "Invalid User Details" });
    }

    // ===== ATTENDANCE LOGIC =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // end of day
        },
      },
    });

    if (!existingAttendance) {
      await prisma.attendance.create({
        data: {
          userId: user.userId,
          checkIn: new Date(),
          date: today,
        },
      });
      console.log(`Attendance marked for user ${user.userId}`);
    } else {
      console.log(`Attendance already exists for user ${user.userId}`);
    }

    // =============================

    return res.status(201).json({ ...user });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/adduser', async (req, res) => {
  try {
    const data = req.json();
    return res.status(201).json({ message: "Data fetched successfully" });
  }
  catch (e) {
    console.log(e);
  }
})

router.post('/checkout', async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(404).json({ message: "Invalid User Details" });
    }

    // // ===== ATTENDANCE LOGIC =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: data.userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // end of day
        },
      },
    });

    if (existingAttendance) {
      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkOut: new Date(),
          remark:data.remark
        },
      });
      console.log(`Checkout marked for user ${data.userId}`);
    } else {
           console.log(`Checkout not marked  for ${data.userId}`);
      return res.status(400).json({ message: "CheckOut Unsuccessful" });
 
    }

    return res.status(201).json({ message: "CheckOut Successfully" });
  }
  catch (e) {
    console.log(e);
  }
})



module.exports = router;