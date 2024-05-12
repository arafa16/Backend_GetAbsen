import Group from "../models/GroupModal.js";

export const getGroups = async(req, res) => {
    try {
        const response = await Group.findAll();

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getGroupsTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Group.findAndCountAll({
            limit:limit,
            offset:offset
        });

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getGroupById = async(req, res) => {
    try {
        const response = await Group.findOne({
            where:{
                uuid:req.params.id
            },
        });

        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createGroup = async(req, res) => {
    const {name, code, isActive} = req.body;

    try {
        await Group.create({
            name:name,
            code:code,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateGroup = async(req, res) => {
    const {name, code, isActive} = req.body;

    const response = await Group.findOne({
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
        return res.status(500).json({msg: error.message});
    }
}

export const deleteGroup = async(req, res) => {
    const response = await Group.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

