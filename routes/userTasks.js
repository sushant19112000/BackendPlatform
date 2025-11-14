var express = require('express');
const prisma = require('../db/dbConnection');
const { getUserTasks, getUserTask } = require('../services/tasks/userTasks');
var router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const taskId = req.query.taskId || -1;
        if (taskId == -1) {
            const tasks = await getUserTasks(userId);
            return res.status(200).json({ message: "Data fetched successfully", data: tasks });
        }
        else {
            const task = await getUserTask(userId, taskId);
            return res.status(200).json({ message: "Data fetched successfully", data: task });
        }
    }
    catch (e) {
        console.log(e);
    }
})

router.post('/', async (req, res) => {
    try {

    }
    catch (e) {

    }
})

router.delete('/:id', async (req, res) => {
    try {

    }
    catch (e) {
        console.log(e);
    }
})