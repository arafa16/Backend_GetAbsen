import StatusInout from '../models/StatusInoutModal.js';

export const getStatusInout = async(req, res) => {
    try {
        const response = await StatusInout.findAll();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getStatusInoutTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await StatusInout.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getStatusInoutById = async(req, res) => {
    try {
        const response = await StatusInout.findOne({
            where:{
                uuid:req.params.id
            }
        });
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createStatusInout = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await StatusInout.create({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({msg: "create status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateStatusInout = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await StatusInout.findOne({
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

        res.status(201).json({msg: "update status success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteStatusInout = async(req, res) => {
    const response = await StatusInout.findOne({
        where:{
            uuid:req.params.id
        }
    });
    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        res.status(200).json({msg: "delete success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}