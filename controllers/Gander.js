import Gander from "../models/GanderModal.js";

export const getGanders = async(req, res) => {
    try {
        const response = await Gander.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getGandersTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Gander.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getGanderById = async(req, res) => {
    try {
        const response = await Gander.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createGander = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await Gander.create({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(201).json({msg: "create status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateGander = async(req, res) => {
    const {name, code, isActive} = req.body;

    const findGander = await Gander.findOne({
        where:{
            uuid:req.params.id
        }
    })

    if(!findGander) return res.status(404).json({msg: "not found"});

    try {
        findGander.update({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(201).json({msg: "update status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteGander = async(req, res) => {
    const findGander = await Gander.findOne({
        where:{
            uuid:req.params.id
        }
    })

    if(!findGander) return res.status(404).json({msg: "not found"});

    try {
        findGander.destroy();

        return res.status(201).json({msg: "delete status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}