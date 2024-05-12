import Bank from "../models/BankModal.js";

export const getBanks = async(req, res) => {
    try {
        const response = await Bank.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getBanksTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Bank.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getBankById = async(req, res) => {
    try {
        const response = await Bank.findOne({
            where:{
                uuid:req.params.id
            }});

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
} 

export const createBank = async(req, res) => {
    const {name, code, isActive} = req.body;
    try {
        await Bank.create({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(201).json({msg: "create bank success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
} 

export const updateBank = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await Bank.findOne({
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

        return res.status(201).json({msg: "update bank success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
} 

export const deleteBank = async(req, res) => {
    const response = await Bank.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(201).json({msg: "delete bank success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
} 