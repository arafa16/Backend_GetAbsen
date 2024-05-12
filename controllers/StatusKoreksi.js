import StatusKoreksi from "../models/StatusKoreksiModal.js";

export const getStatusKoreksi = async(req, res) => {
    try {
        const response = await StatusKoreksi.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getStatusKoreksiTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await StatusKoreksi.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getStatusKoreksiById = async(req, res) => {
    try {
        const response = await StatusKoreksi.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const createStatusKoreksi = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await StatusKoreksi.create({
            name:name,
            code:code,
            isActive:isActive
        });
        
        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateStatusKoreksi = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await StatusKoreksi.findOne({
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
        
        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteStatusKoreksi = async(req, res) => {
    
    const response = await StatusKoreksi.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});
    
    try {
        await response.destroy();
        
        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}