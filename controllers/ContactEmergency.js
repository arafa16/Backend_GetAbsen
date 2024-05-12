import ContactEmergency from "../models/ContactEmergencyModal.js";

export const getKontaks = async(req, res) => {
    try {
        const response = await ContactEmergency.findAll();

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getKontaksTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await ContactEmergency.findAndCountAll({
            limit:limit,
            offset:offset,
        });

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getKontakById = async(req, res) => {
    try {
        const response = await ContactEmergency.findOne({
            where:{
                uuid:req.params.id
            }
        });

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createKontak = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await ContactEmergency.create({
            name:name,
            code:code,
            isActive:isActive
        });

        res.status(201).json({msg: "create kontak success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateKontak = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await ContactEmergency.findOne({
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

        res.status(201).json({msg: "update kontak success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteKontak = async(req, res) => {
    const response = await ContactEmergency.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        res.status(201).json({msg: "delete kontak success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}