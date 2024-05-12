import TipeEvent from "../models/TipeEventModal.js";

export const getTipeEvents = async(req, res) => {
    try {
        const response = await TipeEvent.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}

export const getTipeEventsById = async(req, res) => {

    try {
        const response = await TipeEvent.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}

export const getTipeEventsTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await TipeEvent.findAndCountAll({
            limit:limit,
            offset:offset,
            order: [
                ['code', 'ASC']
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}

export const createTipeEvents = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        const response = await TipeEvent.create({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({msg: 'create tipe event success'});
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}

export const updateTipeEvents = async(req, res) => {
    const {name, code, isActive} = req.body;

    const findTipeEvents = await TipeEvent.findOne({
        where:{
            uuid:req.params.id
        }
    })

    try {
        findTipeEvents.update({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({msg: 'update tipe event success'});
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}

export const deleteTipeEvents = async(req, res) => {
    try {
        const response = await TipeEvent.findOne({
            where:{
                uuid:req.params.id
            }
        });

        if(!response) return res.status(404).json({msg: 'event tipe not found'});

        response.destroy();

        return res.status(200).json({msg: 'delete success'});
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}