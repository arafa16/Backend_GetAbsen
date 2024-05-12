import Koreksi from "../models/KoreksiModal.js";
import HistoryKoreksi from "../models/HistoryKoreksiModal.js";
import Users from "../models/UsersModel.js";
import StatusKoreksi from "../models/StatusKoreksiModal.js";
import InOut from "../models/InOutModal.js";
import TipeAbsen from "../models/TipeAbsenModal.js";
import Pelanggaran from "../models/PelanggaranModal.js";
import Status from "../models/StatusModel.js";
import StatusInout from "../models/StatusInoutModal.js";
import JamOperasional from "../models/JamOperasionalModal.js";

export const getKoreksi = async(req, res) => {
    try {
        const response = await Koreksi.findAll({
            attributes:['uuid','keterangan'],
            include:[
                {
                    model:Users,
                    attributes:['uuid','name','absenId']
                },
                // {
                //     model:InOut,
                //     attributes:['uuid','tanggalMasuk','tanggalPulang']
                // },
                {
                    model:StatusKoreksi,
                    attributes:['uuid','name']
                }
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getKoreksiTable = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    const offset = (page - 1) * limit;

    try {
        const response = await Koreksi.findAndCountAll({
            limit:limit,
            offset:offset,
            attributes:['uuid','keterangan'],
            include:[
                {
                    model:Users,
                    attributes:['uuid','name','absenId']
                },
                {
                    model:InOut,
                    attributes:['uuid','tanggalMasuk','tanggalPulang']
                },
                {
                    model:StatusKoreksi,
                    attributes:['uuid','name']
                }
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getKoreksiTableByUser = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);
    const statusCode = parseInt(req.params.statusCode);
    const id = req.params.id;

    const offset = (page - 1) * limit;

    const findUser = await Users.findOne({
        where:{
            uuid:id
        }
    })

    if(!findUser) return res.status(404).json({msg : "user not found"});

    console.log(findUser, 'find users');
    try {
        if(statusCode !== 0){
            console.log('sampai')
            const response = await Koreksi.findAndCountAll({
                limit:limit,
                offset:offset,
                attributes:['uuid','keterangan'],
                where:{
                    userId:findUser.id
                },
                include:[
                    {
                        model:Users,
                        attributes:['uuid','name','absenId']
                    },
                    {
                        model:InOut,
                        attributes:['uuid','tanggalMulai','tanggalSelesai']
                    },
                    {
                        model:StatusKoreksi,
                        where:{
                            code:statusCode
                        },
                        attributes:['uuid','name','code']
                    }
                ]
            });
    
            return res.status(200).json(response);
        }
        else{
            console.log('sampai')
            const response = await Koreksi.findAndCountAll({
                limit:limit,
                offset:offset,
                attributes:['uuid','keterangan'],
                where:{
                    userId:findUser.id
                },
                include:[
                    {
                        model:Users,
                        attributes:['uuid','name','absenId']
                    },
                    {
                        model:InOut,
                        attributes:['uuid','tanggalMulai','tanggalSelesai']
                    },
                    {
                        model:StatusKoreksi,
                        attributes:['uuid','name','code']
                    }
                ]
            });
    
            return res.status(200).json(response);
        }
        
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getKoreksiByUser = async(req, res) => {
    const id = req.params.id;

    const findUser = await Users.findOne({
        where:{
            uuid:id
        }
    })

    if(!findUser) return res.status(404).json({msg : "user not found"});

    try {        
        const response = await Koreksi.findAndCountAll({
            attributes:['uuid','keterangan'],
            where:{
                userId:findUser.id
            },
            include:[
                {
                    model:Users,
                    attributes:['uuid','name','absenId']
                },
                {
                    model:InOut,
                    attributes:['uuid','tanggalMulai','tanggalSelesai']
                },
                {
                    model:StatusKoreksi,
                    attributes:['uuid','name','code']
                }
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getKoreksiTableByApprover = async(req, res) => {
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);
    const statusCode = parseInt(req.params.statusCode);
    const id = req.params.id;

    const offset = (page - 1) * limit;

    const findUser = await Users.findOne({
        where:{
            uuid:id
        }
    })

    if(!findUser) return res.status(404).json({msg : "user not found"});

    try {
        if(statusCode !== 0){
            const response = await Koreksi.findAndCountAll({
                limit:limit,
                offset:offset,
                attributes:['uuid','keterangan'],
                include:[
                    {
                        model:Users,
                        attributes:['uuid','name','absenId','atasanId'],
                        where:{
                            atasanId:findUser.id
                        }
                    },
                    {
                        model:InOut,
                        attributes:['uuid','tanggalMulai','tanggalSelesai']
                    },
                    {
                        model:StatusKoreksi,
                        where:{
                            code:statusCode
                        },
                        attributes:['uuid','name','code']
                    }
                ]
            });
    
            return res.status(200).json(response);
        }
        else{
            const response = await Koreksi.findAndCountAll({
                limit:limit,
                offset:offset,
                attributes:['uuid','keterangan'],
                include:[
                    {
                        model:Users,
                        attributes:['uuid','name','absenId','atasanId'],
                        where:{
                            atasanId:findUser.id
                        }
                    },
                    {
                        model:InOut,
                        attributes:['uuid','tanggalMulai','tanggalSelesai']
                    },
                    {
                        model:StatusKoreksi,
                        attributes:['uuid','name','code']
                    }
                ]
            });
    
            return res.status(200).json(response);
        }

    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getKoreksiByApprover = async(req, res) => {
    const id = req.params.id;

    const findUser = await Users.findOne({
        where:{
            uuid:id
        }
    })

    if(!findUser) return res.status(404).json({msg : "user not found"});

    try {
        const response = await Koreksi.findAndCountAll({
            attributes:['uuid','keterangan'],
            include:[
                {
                    model:Users,
                    attributes:['uuid','name','absenId','atasanId'],
                    where:{
                        atasanId:findUser.id
                    }
                },
                {
                    model:InOut,
                    attributes:['uuid','tanggalMulai','tanggalSelesai']
                },
                {
                    model:StatusKoreksi,
                    attributes:['uuid','name','code']
                }
            ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const getKoreksiById = async(req, res) => {
    
    try {
        const response = await Koreksi.findOne({
            where:{
                uuid:req.params.id
            },
            attributes:['uuid','keterangan'],
            include:[{
                model:Users,
                attributes:['uuid','name','absenId'],
                include:{
                    model:Users,
                    as: 'atasan',
                    attributes:['uuid','name']
                }
            },{
                model:InOut,
                attributes:['uuid','tanggalMulai','tanggalSelesai'],
                include:[{
                    model:TipeAbsen,
                    attributes:['uuid','name','code']
                },{
                    model:Pelanggaran,
                    attributes:['uuid','name','code']
                },
                {
                    model:StatusInout,
                    attributes:['uuid','name','code']
                }
            ]
            },{
                model:StatusKoreksi,
                attributes:['uuid','name','code']
            }
        ]
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

export const createKoreksi = async(req, res) => {
    const {userId, inOutId, keterangan, codeStatusKoreksi, isActive, codeStatusInout} = req.body;

    const user = await Users.findOne({
        where:{
            uuid:userId
        }
    });

    if(!user) return res.status(404).json({msg: "user not found"});

    const statusKoreksi = await StatusKoreksi.findOne({
        where:{
            code:codeStatusKoreksi
        }
    });

    if(!statusKoreksi) return res.status(404).json({msg: "status koreksi not found"});

    const inOut = await InOut.findOne({
        where:{
            uuid:inOutId
        }
    });

    if(!inOut) return res.status(404).json({msg: "absen not found"});

    const statusInout = await StatusInout.findOne({
        where:{
            code:codeStatusInout
        }
    })

    console.log(statusInout, 'statusInout');

    if(!statusInout) return res.status(404).json({msg: "status inout not found"});

    try {
        await Koreksi.create({
            userId:user && user.id,
            inOutId:inOut && inOut.id,
            keterangan:keterangan,
            statusKoreksiId:statusKoreksi && statusKoreksi.id,
            isActive:isActive
        });

        await inOut.update({
            statusInoutId:statusInout && statusInout.id
        });

        return res.status(201).json({msg: "koreksi success created"});
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const createKoreksiByDate = async(req, res) => {
    const {userId, tanggalMulai, tanggalSelesai, tipeAbsenId, codePelanggaran, keterangan, codeStatusKoreksi, isActive, codeStatusInout, jamOperasionalId, isAbsenWeb} = req.body;

    const user = await Users.findOne({
        where:{
            uuid:userId
        }
    });

    if(!user) return res.status(404).json({msg: "user not found"});

    const statusKoreksi = await StatusKoreksi.findOne({
        where:{
            code:codeStatusKoreksi
        }
    });

    if(!statusKoreksi) return res.status(404).json({msg: "status koreksi not found"});

    const tipeAbsen = await TipeAbsen.findOne({
        where:{
            uuid:tipeAbsenId
        }
    });

    if(!tipeAbsen) return res.status(404).json({msg: "tipe absen not found"});

    const pelanggaran = await Pelanggaran.findOne({
        where:{
            code:codePelanggaran
        }
    });

    if(!pelanggaran) return res.status(404).json({msg: "pelanggaran not found"});


    // const inOut = await InOut.findOne({
    //     where:{
    //         uuid:inOutId
    //     }
    // });

    // if(!inOut) return res.status(404).json({msg: "absen not found"});

    const statusInout = await StatusInout.findOne({
        where:{
            code:codeStatusInout
        }
    })

    // console.log(statusInout, 'statusInout');

    if(!statusInout) return res.status(404).json({msg: "status inout not found"});

    const jamOperasional = await JamOperasional.findOne({
        where:{
            uuid:jamOperasionalId
        }
    });

    if(!jamOperasional) return res.status(404).json({msg: "jam operasional not found"});

    try {
        const createInOut = await InOut.create({
            userId:user && user.id,
            tanggalMulai:tanggalMulai,
            tanggalSelesai:tanggalSelesai,
            tipeAbsenId:tipeAbsen && tipeAbsen.id,
            pelanggaranId:pelanggaran && pelanggaran.id,
            statusInoutId:statusInout && statusInout.id,
            jamOperasionalId:jamOperasional && jamOperasional.id,
            isAbsenWeb:isAbsenWeb
        });

        await Koreksi.create({
            userId:user && user.id,
            inOutId:createInOut.id,
            keterangan:keterangan,
            statusKoreksiId:statusKoreksi && statusKoreksi.id,
            isActive:isActive
        });

        return res.status(201).json({msg: "koreksi success created"});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({msg: error.message});
    }
}

export const updateKoreksi = async(req, res) => {
    const {userId, inOutId, keterangan, statusKoreksiId, isActive} = req.body;

    const response = await Koreksi.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    const user = await Users.findOne({
        where:{
            uuid:userId
        }
    });

    if(!user) return res.status(404).json({msg: "user not found"});

    const statusKoreksi = await StatusKoreksi.findOne({
        where:{
            uuid:statusKoreksiId
        }
    });

    if(!statusKoreksi) return res.status(404).json({msg: "status koreksi not found"});

    const inOut = await InOut.findOne({
        where:{
            uuid:inOutId
        }
    });

    if(!inOut) return res.status(404).json({msg: "absen not found"});

    try {
        response.create({
            userId:user && user.id,
            inOutId:inOut && inOut.id,
            keterangan:keterangan,
            statusKoreksiId:statusKoreksi && statusKoreksi.id,
            isActive:isActive
        });

        return res.status(201).json({msg: "koreksi success created"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const approveKoreksi = async(req, res) => {
    const {statusKoreksiId} = req.body;

    const response = await Koreksi.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    const statusKoreksi = await StatusKoreksi.findOne({
        where:{
            code:statusKoreksiId
        }
    });

    if(!statusKoreksi) return res.status(404).json({msg: "status koreksi not found"});

    try {
        response.update({
            statusKoreksiId:statusKoreksi && statusKoreksi.id
        });

        return res.status(201).json({msg: "action change success"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}

export const deleteKoreksi = async(req, res) => {
    const response = await Koreksi.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!response) return res.status(404).json({msg: "not found"});

    try {
        response.destroy();

        return res.status(200).json({msg: "koreksi success created"})
    } catch (error) {
        return res.status(500).json({msg: error.message});
    }
}