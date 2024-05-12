import Penempatan from "../models/PenempatanModel.js";

export const getPenempatans = async(req, res) => {
    try {
        const response = await Penempatan.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getPenempatansTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Penempatan.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getPenempatanById = async(req, res) => {
    try {
        const response = await Penempatan.findOne({
            where:{
                'uuid':req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createPenempatan = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await Penempatan.create({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({msg: "create penempatan success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updatePenempatan = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await Penempatan.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.update({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({msg: "update penempatan success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deletePenempatan = async(req, res) => {
    const response = await Penempatan.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        res.status(201).json({msg: "delete success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}