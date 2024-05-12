import TipePendapatan from "../models/TipePendapatan.js";

export const getTipePendapatan = async(req, res) => {
    try {
        const response = await TipePendapatan.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getTipePendapatanTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await TipePendapatan.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getTipePendapatanById = async(req, res) => {
    try {
        const response = await TipePendapatan.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const createTipePendapatan = async(req, res) => {
    const {code, name, isActive} = req.body;

    try {
        await TipePendapatan.create({
            code:code,
            name:name,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateTipePendapatan = async(req, res) => {
    const {code, name, isActive} = req.body;

    const response = await TipePendapatan.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.update({
            code:code,
            name:name,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteTipePendapatan = async(req, res) => {
    const response = await TipePendapatan.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}