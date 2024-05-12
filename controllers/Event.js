import Event from "../models/EventModal.js";
import TipeEvent from "../models/TipeEventModal.js";
import { Op } from "sequelize";
export const getEvents = async(req, res) => {
    try {
        const response = await Event.findAll({
            include:[
                {model:TipeEvent}
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error})
    }
}

export const getEventsById = async(req, res) => {
    try {
        const response = await Event.findOne({
            where:{
                uuid:req.params.id
            },
            include:[
                    {model:TipeEvent}
                ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error})
    }
}

export const getEventsByMonth = async(req, res) => {
    const {bulan, tahun} = req.params;
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Event.findAndCountAll({
            limit:limit,
            offset:offset,
            order: [
                ['code', 'ASC']
            ],
            where:{
                [Op.and]: [
                    { bulan: bulan },
                    { tahun: tahun }
                  ]
            },
            include:[
                    {model:TipeEvent}
                ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error})
    }
}

export const getEventsTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Event.findAndCountAll({
            limit:limit,
            offset:offset,
            order: [
                ['code', 'ASC']
            ],
            include:[
                {model:TipeEvent}
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg:error.msg})
    }
}

export const createEvents = async(req, res) => {
    const {name, bulan, tahun, tanggalMulai, tanggalSelesai, tipeEventId, code, isActive } = req.body;

    const findTipeEvent = await TipeEvent.findOne({
        where:{
            uuid:tipeEventId
        }
    });

    if(!findTipeEvent) return res.status(404).json({msg: 'tipe event not found'});

    try {
        const response = await Event.create({
            name:name,
            bulan:bulan,
            tahun:tahun,
            tanggalMulai:tanggalMulai,
            tanggalSelesai:tanggalSelesai,
            tipeEventId:findTipeEvent.id,
            code:code,
            isActive:isActive
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error})
    }
}

export const updateEvents = async(req, res) => {
    const {name, bulan, tahun, tanggalMulai, tanggalSelesai, tipeEventId, code, isActive } = req.body;

    const findTipeEvent = await TipeEvent.findOne({
        where:{
            uuid:tipeEventId
        }
    });

    if(!findTipeEvent) return res.status(404).json({msg: 'tipe event not found'});

    const findEvent = await Event.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findEvent) return res.status(404).json({msg: 'event not found'});

    try {
        await findEvent.update({
            name:name,
            bulan:bulan,
            tahun:tahun,
            tanggalMulai:tanggalMulai,
            tanggalSelesai:tanggalSelesai,
            tipeEventId:findTipeEvent.id,
            code:code,
            isActive:isActive
        });

        return res.status(200).json({mag: 'update success'});
    } catch (error) {
        return res.status(500).json({msg: error})
    }
}

export const deleteEvents = async(req, res) => {
    try {
        const response = await Event.findOne({
            where:{
                uuid:req.params.id
            }
        });

        if(!response) return res.status(404).json({msg: 'event not found'});

        response.destroy();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error})
    }
}