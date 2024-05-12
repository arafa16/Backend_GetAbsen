import Pelanggaran from "../models/PelanggaranModal.js";

export const getPelanggaran = async(req, res) => {
    try {
        const response = await Pelanggaran.findAll({
            attributes:['uuid','name']
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getPelanggaranTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Pelanggaran.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getPelanggaranById = async(req, res) => {
    try {
        const response = await Pelanggaran.findOne({
            where:{
                uuid:req.params.id
            }});

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const createPelanggaran = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await Pelanggaran.create({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const updatePelanggaran = async(req, res) => {
    const {name, code, isActive} = req.body;
    
    const response = await Pelanggaran.findOne({
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

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const deletePelanggaran = async(req, res) => {
    const response = await Pelanggaran.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}