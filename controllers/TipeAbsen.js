import TipeAbsen from "../models/TipeAbsenModal.js";

export const getTipeAbsen = async(req, res) => {
    try {
        const response = await TipeAbsen.findAll({
            order: [ [ 'code', 'DESC' ]]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getTipeAbsenTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await TipeAbsen.findAndCountAll({
            limit:limit,
            offset:offset,
            order: [
                ['code', 'ASC']
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getTipeAbsenById = async(req, res) => {
    try {
        const response = await TipeAbsen.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createTipeAbsen = async(req, res) => {
    const {code, name, isSelect, isActive} = req.body;

    try {
        await TipeAbsen.create({
            code:code,
            name:name,
            isSelect:isSelect,
            isActive:isActive
        });

        return res.status(201).json({msg: "create tipe success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateTipeAbsen = async(req, res) => {
    const {code, name, isSelect, isActive} = req.body;

    const response = await TipeAbsen.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.update({
            code:code,
            name:name,
            isSelect:isSelect,
            isActive:isActive
        });

        return res.status(201).json({msg: "update tipe success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteTipeAbsen = async(req, res) => {
    const response = await TipeAbsen.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(201).json({msg: "create tipe success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}