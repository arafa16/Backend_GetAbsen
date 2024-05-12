import TipeNotification from "../models/TipeNotificationModal.js";

export const getTipeNotification = async(req,res) => {
    try {
        const response = await TipeNotification.findAll({
            attributes:['uuid','name']
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getTipeNotificationTable = async(req,res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await TipeNotification.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getTipeNotificationById = async(req,res) => {
    try {
        const response = await TipeNotification.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const createTipeNotification = async(req,res) => {
    const {code, name, isActive} = req.body;

    try {
        await TipeNotification.create({
            code:code,
            name:name,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateTipeNotification = async(req,res) => {
    const {code, name, isActive} = req.body;

    const response = await TipeNotification.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        await response.update({
            code:code,
            name:name,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteTipeNotification = async(req,res) => {
    const response = await TipeNotification.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        await response.destroy();

        return res.status(200).json({msg: "success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}