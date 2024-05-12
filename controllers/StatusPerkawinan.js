import StatusPerkawinan from "../models/StatusPerkawinanModal.js";

export const getStatuses = async(req, res) => {
    try {
        const response = await StatusPerkawinan.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getStatusesTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await StatusPerkawinan.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getStatusById = async(req, res) => {
    try {
        const response = await StatusPerkawinan.findOne({
            where:{
                uuid:req.params.id
            }
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.msg});
    }
}

export const createStatus = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await StatusPerkawinan.create({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({mag: "create status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateStatus = async(req, res) => {
    const {name, code, isActive} = req.body;
    
    const response = await StatusPerkawinan.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        await response.update({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({mag: "update status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteStatus = async(req, res) => {
    const response = await StatusPerkawinan.findOne({
        uuid:req.params.id
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        res.status(201).json({mag: "delete status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}