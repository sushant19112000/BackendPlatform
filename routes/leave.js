var express = require('express');
const prisma = require('../db/dbConnection');
var router = express.Router();

const now = new Date();

// Today at 00:00:00
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// Tomorrow at 00:00:00
const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);



/**
 * Apply for leave
 */
router.post("/apply", async (req, res) => {
  try {
    const { userId, leaveType, fromDate, toDate, duration, reason } = req.body;

    const leave = await prisma.userLeave.create({
      data: {
        userId,
        leaveType,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        duration,
        reason,
      },
    });

    res.json({ success: true, leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error applying for leave" });
  }
});

/**
 * Get logged-in user's leaves
 */


router.get("/user-attendence/:userId", async (req, res) => {
  try {
    const { userId } = req.params;


    // --- Define leave policy ---
    const leavePolicy = {
      CASUAL: 12,
      SICK: 12,
      UNPAID: 5,
    };



    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: Number(userId),
        checkIn: {
          gte: todayStart,
          lt: tomorrowStart,
        }
      },
      select: { checkIn: true, checkOut: true }
    })




    // --- Fetch all user leaves ---
    const leaves = await prisma.userLeave.findMany({
      where: { userId: Number(userId) },
      orderBy: { created_at: "desc" },
    });

    // --- Count approved leaves per type ---
    const [casualUsed, sickUsed, unpaidUsed] = await Promise.all([
      prisma.userLeave.count({
        where: { userId: Number(userId), leaveType: "CASUAL", status: "APPROVED" },
      }),
      prisma.userLeave.count({
        where: { userId: Number(userId), leaveType: "SICK", status: "APPROVED" },
      }),
      prisma.userLeave.count({
        where: { userId: Number(userId), leaveType: "UNPAID", status: "APPROVED" },
      }),
    ]);

    // --- Prepare summary ---
    const summary = [
      {
        label: "Casual Leave",
        available: Math.max(leavePolicy.CASUAL - casualUsed, 0),
        total: leavePolicy.CASUAL,
        color: "bg-blue-500",
      },
      {
        label: "Sick Leave",
        available: Math.max(leavePolicy.SICK - sickUsed, 0),
        total: leavePolicy.SICK,
        color: "bg-red-500",
      },
      {
        label: "Unpaid Leave",
        available: Math.max(leavePolicy.UNPAID - unpaidUsed, 0),
        total: leavePolicy.UNPAID,
        color: "bg-gray-500",
      },
    ];

    // --- Send both sections together ---
    res.json({
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      summary,
      leaves,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user leave summary and records" });
  }
});




router.get("/pending", async (req, res) => {
  try {
    const pendingLeaves = await prisma.userLeave.findMany({
      where: { status: "PENDING" },
      include: { user: true },
    });

    res.json(pendingLeaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending leaves" });
  }
});

/**
 * Admin: Approve or Reject leave
 */
router.post("/approve", async (req, res) => {
  try {
    const { leaveId, approvedById, action } = req.body; // action = 'APPROVE' or 'REJECT'

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const leave = await prisma.userLeave.update({
      where: { id: Number(leaveId) },
      data: {
        status: newStatus,
        approvedById: Number(approvedById),
      },
    });

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating leave status" });
  }
});

/**
 * Summary for dashboard cards
 */
router.get("/summary/counts", async (req, res) => {
  try {
    const totalEmployees = await prisma.user.count();
    const today = new Date();


    const onLeaveCount = await prisma.userLeave.count({
      where: {
        fromDate: { lte: today },
        toDate: { gte: today },
        status: "APPROVED",
      },
    });


    const presentCount = totalEmployees - onLeaveCount;

    const casualCount = await prisma.userLeave.count({
      where: { leaveType: "CASUAL", status: "APPROVED" },
    });

    const sickCount = await prisma.userLeave.count({
      where: { leaveType: "SICK", status: "APPROVED" },
    });

    // const breakCount = await prisma.userBreak.count({
    //   where: { endedAt: null },
    // });

    res.json({
      totalPresent: presentCount,
      totalEmployees,
      onCasualLeave: casualCount,
      onSickLeave: sickCount,
      onBreak: 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching summary" });
  }
});



router.get("/summary/records", async (req, res) => {
  try {

    const leaves = await prisma.userLeave.findMany(
      {
        include: { user: { select: { name: true } }, approvedBy: { select: { name: true } } }

      });

    const attendance = await prisma.attendance.findMany({
      where: {
        checkIn: {
          gte: todayStart,
          lt: tomorrowStart,
        }
      },
      select: { user: { select: { name: true } }, checkIn: true, checkOut: true }
    })


    // const breakCount = await prisma.userBreak.count({
    //   where: { endedAt: null },
    // });

    res.json({
      leaves,
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching summary" });
  }
});

module.exports = router;