import Notification from "../models/NotificationModal.js";
import Status from "../models/StatusModel.js";
import TipeNotification from "../models/TipeNotificationModal.js";
import Users from "../models/UsersModel.js";

export const getNotification = async(req, res) => {
    try {
        const response = await Notification.findAll({
            attributes:['uuid','keterangan'],
            include:[{
                model:Users,
                attributes:['uuid','name']
            },{
                model:TipeNotification,
                attributes:['uuid','name']
            },{
                model:Status,
                attributes:['uuid','name']
            }]
        });

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getNotificationByUser = async(req, res) => {
    const response = await Users.findOne({
        where:{
            userId:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "user not found"});

    try {
        await Notification.findAll({
            where:{
                userId:findUser.id
            },
            attributes:['uuid','keterangan'],
            include:[{
                model:Users,
                attributes:['uuid','name']
            },{
                model:TipeNotification,
                attributes:['uuid','name']
            },{
                model:Status,
                attributes:['uuid','name']
            }]
        });

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getNotificationById = async(req, res) => {
    try {
        const response = await Notification.findOne({
            where:{
                uuid:req.params.id
            },
            attributes:['uuid','keterangan'],
            include:[{
                model:Users,
                attributes:['uuid','name']
            },{
                model:TipeNotification,
                attributes:['uuid','name']
            },{
                model:Status,
                attributes:['uuid','name']
            }]
        });

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createNotification = async(req, res) => {
    const {userId, keterangan, tipeNotificationId, statusId, isActive } = req.body;

    const user = await Users.findOne({
        where:{
            uuid:userId
        }
    });

    const tipeNotification = await TipeNotification.findOne({
        where:{
            uuid:tipeNotificationId
        }
    });

    const status = await Status.findOne({
        where:{
            uuid:statusId
        }
    })

    try {
        await Notification.create({
            userId:user && user.id,
            keterangan:keterangan,
            tipeNotificationId:tipeNotification && tipeNotification.id,
            statusId:status && status.id,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updateNotification = async(req, res) => {
    const {userId, keterangan, tipeNotificationId, statusId, isActive } = req.body;

    const findNotif = await Notification.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findNotif) return res.status(404).json({msg: "not found"});

    const user = await Users.findOne({
        where:{
            uuid:userId
        }
    });

    const tipeNotification = await TipeNotification.findOne({
        where:{
            uuid:tipeNotificationId
        }
    });

    const status = await Status.findOne({
        where:{
            uuid:statusId
        }
    })

    try {
        await findNotif.update({
            userId:user && user.id,
            keterangan:keterangan,
            tipeNotificationId:tipeNotification && tipeNotification.id,
            statusId:status && status.id,
            isActive:isActive
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteNotification = async(req, res) => {
    const response = await Notification.findOne({
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