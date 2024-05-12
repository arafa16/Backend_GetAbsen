import Privilege from "../models/PrivilegeModal.js";
import Users from "../models/UsersModel.js";

export const getPrivileges = async(req, res) => {
    try {
        const response = await Privilege.findAll();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getPrivilegesTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Privilege.findAndCountAll({
            limit:limit,
            offset:offset,
            include:{
                model:Users
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const getPrivilegeById = async(req, res) => {
    try {
        const response = await Privilege.findOne({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createPrivilege = async(req, res) => {
    const {
        userId, 
        dashboard, 
        editUserSub, 
        absen, 
        kalendarSub,
        absenModal,
        wfhModal,
        shiftModal,
        absenCheck,
        adminEvent,
        perhitunganAbsen,
        pengajuanKoreksiSub, 
        approvalKoreksiSub,
        approvalAllKoreksiSub,
        employees,
        dataEmployee,
        slipGaji,
        pendapatanSub,
        pendapatanLainSub,
        pendapatanAdminSub,
        attribute,
        setting
    } = req.body;

    try {
        const privilege = await Privilege.create({
                            userId:userId, 
                            dashboard:dashboard, 
                            editUserSub:editUserSub, 
                            absen:absen, 
                            kalendarSub:kalendarSub,
                            absenModal:absenModal,
                            wfhModal:wfhModal,
                            shiftModal:shiftModal,
                            absenCheck:absenCheck,
                            adminEvent:adminEvent,
                            perhitunganAbsen:perhitunganAbsen,
                            pengajuanKoreksiSub:pengajuanKoreksiSub, 
                            approvalKoreksiSub:approvalKoreksiSub,
                            approvalAllKoreksiSub:approvalAllKoreksiSub,
                            slipGaji:slipGaji,
                            pendapatanSub:pendapatanSub,
                            pendapatanLainSub:pendapatanLainSub,
                            pendapatanAdminSub:pendapatanAdminSub,
                            employees:employees,
                            dataEmployee:dataEmployee,
                            attribute:attribute,
                            setting:setting
                        });
        
        const user = await Users.update({
                privilegeId:privilege.id
            },{
                where:{
                    uuid:userId
                }
            }
        )

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const updatePrivilege = async(req, res) => {
    const {
        userId, 
        dashboard, 
        editUserSub, 
        absen, 
        kalendarSub,
        absenModal,
        wfhModal,
        shiftModal,
        absenCheck,
        adminEvent,
        perhitunganAbsen,
        pengajuanKoreksiSub, 
        approvalKoreksiSub,
        approvalAllKoreksiSub,
        employees,
        dataEmployee,
        slipGaji,
        pendapatanSub,
        pendapatanLainSub,
        pendapatanAdminSub,
        attribute,
        setting    
        } = req.body;
    
    const response = await Privilege.findOne({
        where:{
            uuid:req.params.id
        }
    });
    
    if(!response) return res.status(404).json({msg: "privilege not found"});
    
    try {
        response.update({
            userId:userId, 
            dashboard:dashboard, 
            editUserSub:editUserSub, 
            absen:absen, 
            kalendarSub:kalendarSub,
            absenModal:absenModal,
            wfhModal:wfhModal,
            shiftModal:shiftModal,
            absenCheck:absenCheck,
            adminEvent:adminEvent,
            perhitunganAbsen:perhitunganAbsen,
            pengajuanKoreksiSub:pengajuanKoreksiSub, 
            approvalKoreksiSub:approvalKoreksiSub,
            approvalAllKoreksiSub:approvalAllKoreksiSub,
            slipGaji:slipGaji,
            pendapatanSub:pendapatanSub,
            pendapatanLainSub:pendapatanLainSub,
            pendapatanAdminSub:pendapatanAdminSub,
            employees:employees,
            dataEmployee:dataEmployee,
            attribute:attribute,
            setting:setting
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deletePrivilege = async(req, res) => {
    const response = await PeriodeKerja.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        await response.destroy({
            where:{
                uuid:req.params.id
            }
        });

        return res.status(200).json({msg: "delete success"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}