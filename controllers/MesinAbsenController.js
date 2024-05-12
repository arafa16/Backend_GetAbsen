import { where } from "sequelize";
import MesinAbsen from "../models/MesinAbsenModal.js";
import { getDataByFingerByCron } from "./InOut.js";

export const getMesinAbsen = async(req, res) => {
    try {
        const response = await MesinAbsen.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error});
    }
}

export const getMesinAbsenTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);
    const status = req.params.status;

    const offset = (page - 1) * limit;

    try {
        const response = await MesinAbsen.findAndCountAll({
            limit:limit,
            offset:offset
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error});
    }
}

export const getMesinAbsenById = async(req, res) => {
    try {
        const response = await MesinAbsen.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error});
    }
}

export const createMesinAbsen = async(req, res) => {
    const {name, ipMesin, code, isActive} = req.body;

    try {
        await MesinAbsen.create({
            name:name,
            ipMesin:ipMesin,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateMesinAbsen = async(req, res) => {
    const {name, ipMesin, code, isActive} = req.body;

    const findMesin = await MesinAbsen.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findMesin) return res.status(404).json({msg: "tidak ada mesin"});

    try {
        await findMesin.update({
            name:name,
            ipMesin:ipMesin,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteMesinAbsen = async(req, res) => {

    const findMesin = await MesinAbsen.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findMesin) return res.status(404).json({msg: "tidak ada mesin"});

    try {
        await findMesin.destroy();

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getDataMesinAbsen = async(req, res) => {

    const mesinAbsen = []; 

    const findIpMesin = await MesinAbsen.findAll();

    if(!findIpMesin) return res.status(404).json({msg: "tidak ada IP mesin absen"});
    
    try {
        for(let i = 0; i < findIpMesin.length; i++){
            const ip = findIpMesin[i].ipMesin;
            await getDataByFingerByCron(ip);
            // mesinAbsen.push(findIpMesin[i].ipMesin);
            console.log(findIpMesin[i], 'find mesin absen');
        }

        console.log('get data success');
        return res.status(200).json(findIpMesin[0].ipMesin);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getDataMesinAbsenCron = async(req, res) => {

    const findIpMesin = await MesinAbsen.findAll();

    if(!findIpMesin) return res.status(404).json({msg: "tidak ada IP mesin absen"});
    
    try {
        for(let i = 0; i < findIpMesin.length; i++){
            const ip = findIpMesin[i].ipMesin;
            await getDataByFingerByCron(ip);
            // console.log(findIpMesin[i], 'find mesin absen');
        }
        
        console.log('get data success');
    } catch (error) {
        console.log(error);
    }
}