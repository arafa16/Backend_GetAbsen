import GolonganDarah from "../models/GolonganDarahModel.js";

export const getGolonganDarahs = async(req, res) => {
    try {
        const response = await GolonganDarah.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getGolonganDarahsTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await GolonganDarah.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getGolonganDarahById = async(req, res) => {
    try {
        const response = await GolonganDarah.findOne({
            where:{
                uuid:req.params.id
            }});

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createGolonganDarah = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await GolonganDarah.create({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(201).json({msg: "create golongan darah success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateGolonganDarah = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await GolonganDarah.findOne({
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

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteGolonganDarah = async(req, res) => {
    const response = await GolonganDarah.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(200).json({msg: "delete golongan darah success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}