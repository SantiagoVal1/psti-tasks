
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const TaskSchema = new mongoose.Schema({
    TaskId: {
        type: Number,
        required: true,
        unique: true
    },
    Name: {
        type: String,
        required: true
    },
    Deadline: {
        type: Date,
        required: true
    }
});

const TaskModel = mongoose.model('task', TaskSchema, 'Tasks');

// Probar la conexión
router.get('/test-db', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.status(200).json({
            message: 'Conexión con MongoDB exitosa'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'No se pudo verificar la conexión'
        });
    }
});

// Crear una tarea
router.post('/create-task', async (req, res) => {
    try {
        const task = new TaskModel({
            TaskId: req.body.TaskId,
            Name: req.body.Name,
            Deadline: req.body.Deadline
        });

        await task.save();
        res.status(201).json({
            message: 'Tarea creada correctamente',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error: 'No se pudo crear la tarea'
        });
    }
});

// Consultar todas las tareas
router.get('/all-tasks', async (req, res) => {
    try {
        const tasks = await TaskModel.find();
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'No se pudieron consultar las tareas'
        });
    }
});

// Actualizar una tarea
router.post('/update-task', async (req, res) => {
    try {
        const task = await TaskModel.findOneAndUpdate(
            { TaskId: req.body.TaskId },
            {
                Name: req.body.Name,
                Deadline: req.body.Deadline
            },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.status(200).json({
            message: 'Tarea actualizada correctamente',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error: 'No se pudo actualizar la tarea'
        });
    }
});

// Eliminar una tarea
router.delete('/delete-task', async (req, res) => {
    try {
        const task = await TaskModel.findOneAndDelete({
            TaskId: req.body.TaskId
        });

        if (!task) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        res.status(200).json({
            message: 'Tarea eliminada correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'No se pudo eliminar la tarea'
        });
    }
});

module.exports = { router, TaskModel };
