import Pendidikan from "../models/PendidikanModal.js";

export const getPendidikans = async(req, res) => {
    try {
        const response = await Pendidikan.findAll();

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getPendidikansTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Pendidikan.findAndCountAll({
            limit:limit,
            offset:offset
        });

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getPendidikanById = async(req, res) => {
    try {
        const response = await Pendidikan.findOne({
            where:{
                uuid:req.params.id
            }
        });

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createPendidikan = async(req, res) => {
    const {name, code, isActive} = req.body;
    try {
        await Pendidikan.create({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({msg: "success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updatePendidikan = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await Pendidikan.findOne({
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

        res.status(201).json({msg: "success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deletePendidikan = async(req, res) => {
    const response = await Pendidikan.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        res.status(201).json({msg: "success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}