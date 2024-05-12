import { where } from "sequelize";
import JamOperasionalGroup from "../models/JamOperasionalGroupModal.js";

export const getJamOperasionalGroups = async(req, res) => {
    try {
        const response = await JamOperasionalGroup.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg : error})
    }
}

export const getJamOperasionalGroupsById = async(req, res) => {
    try {
        const response = await JamOperasionalGroup.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg : error})
    }
}

export const getJamOperasionalGroupsTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await JamOperasionalGroup.findAndCountAll({
            limit:limit,
            offset:offset,
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg : error})
    }
}

export const createJamOperasionalGroups = async(req, res) => {
    const {name ,keterangan, code, isActive} = req.body;

    try {
        const response = await JamOperasionalGroup.create({
            name:name,
            keterangan:keterangan,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg : error})
    }
}

export const updateJamOperasionalGroups = async(req, res) => {
    const {name ,keterangan, code, isActive} = req.body;

    const findJamOperasionalGroups = await JamOperasionalGroup.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findJamOperasionalGroups) return res.status(404).json({msg: "not found"});

    try {

        await findJamOperasionalGroups.update({
            name:name,
            keterangan:keterangan,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg : error})
    }
}

export const deleteJamOperasionalGroups = async(req, res) => {

    const findJamOperasionalGroups = await JamOperasionalGroup.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findJamOperasionalGroups) return res.status(404).json({msg: "not found"});

    try {
        await findJamOperasionalGroups.destroy();

        return res.status(200).json({msg: "delete success"});
    } catch (error) {
        return res.status(500).json({msg : error})
    }
}