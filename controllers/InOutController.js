import InOut from "../models/InOutModal.js";
import TipeAbsen from "../models/TipeAbsenModal.js";
import Users from "../models/UsersModel.js";
import { FingerprintSolution } from "fingerprint-solution";
import date from 'date-and-time';
import { Op } from "sequelize";
import JamOperasional from "../models/JamOperasionalModal.js";
import JamOperasionalGroup from "../models/JamOperasionalGroupModal.js";

export const getDataMesinAbsen = async(req, res) => {

    const ip = req.params.ip;
    const day = req.params.day;


    //find user
    async function findUser(pin){
        const response = await Users.findOne({
            where:{
                absenId:pin
            },
            include:[
                {
                    model:JamOperasionalGroup,
                    attributes:['id','code']
                }
            ],
            attributes:['id','absenId']
        });
        return response;
    }

    //find tipe absen
    async function findTipeAbsen(code){
        const response = await TipeAbsen.findOne({
            where:{
                code:code
            }
        })
        return response;
    }

    //find in
    async function findIn(data){
        const response = await InOut.findOne({
            where:{
                userId:data.userId,
                // tipeAbsenId:data.tipeAbsenId,
                tanggalMulai:{
                    [Op.and]: {
                        [Op.gte]: data.dateFormat + ' 00:00:00',
                        [Op.lte]: data.dateFormat + ' 23:59:59',
                    }
                }
            },
            include:[{
                    model:TipeAbsen,
                    where:{
                        code: { [Op.in]: data.code }
                    }
                },
                {
                    model:JamOperasional
                }
            ]
        })

        return response
    }

    //find in out
    async function findInOut(data){
        const response = await InOut.findOne({
            where:{
                userId:data.userId,
                // tipeAbsenId:data.tipeAbsenId,
                tanggalMulai:{
                    [Op.and]: {
                        [Op.gte]: data.dateFormat + ' 00:00:00',
                        [Op.lte]: data.dateFormat + ' 23:59:59',
                    }
                },
            },
            include:[{
                model:TipeAbsen,
                where:{
                    code: { [Op.in]: data.code}
                }
            },{
                model:Users
            }]
        })
        // console.log(response, 'find in out');
        return response
    }

    //find jam operasioanl by id
    // async function findJamOperasionalById(id){
    //     const response = await JamOperasional.findOne({
    //         where:{
    //             id:id
    //         }
    //     })

    //     return response;
    // }

    //find jam operasioanl
    async function findJamOperasionals(data){
        const response = await JamOperasional.findOne({
            where:{
                jamMasuk:{ [Op.gte]: data.timeFormat },
                // code:data.code
                jamOperasionalGroupId:data.jamOperasionalGroupId
            }
        })

        return response;
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhir(data) {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                // code:1
                jamOperasionalGroupId:data.jamOperasionalGroupId
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

    // //find jam operasional terkahir digunakan jika tidak absen masuk
    // async function jamOperasionalsTerakhirCode(code) {
    //     const response = await JamOperasional.findAll({
    //         limit:1,
    //         where:{
    //             // tipeAbsenId:1,
    //             code:code
    //         },
    //         order: [ [ 'createdAt', 'DESC' ]]
    //     });

    //     return response
    // }

    //upload absen
    async function uploadAbsen(data){
        const response = await InOut.create({
            userId:data.userId,
            tipeAbsenId:data.tipeAbsenId,
            tanggalMulai:data.tanggalMulai,
            tanggalSelesai:data.tanggalSelesai,
            pelanggaranId:data.pelanggaranId,
            statusInoutId:data.statusInoutId,
            jamOperasionalId:data.jamOperasionalId,
        });

        return response
    }

    
    //array data
    const dataSudahAbsen = [];
    const dataNotFound = [];
    const dataDouble = [];
    const dataDelete = [];

    try {
        const dataAbsen = await FingerprintSolution.download(ip, []);
        
        //batas minimal date untuk filter data
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - day);
        const minimalDate = date.format(dateNow, 'YYYY-MM-DD HH:mm:ss');

        const dataAbsenMinimalDate = dataAbsen.filter(
                data=>data.time > minimalDate
            );

        const absenMasuk = dataAbsenMinimalDate.filter(
                data=>data.status == 0
            );

        const absenPulang = dataAbsenMinimalDate.filter(
                data=>data.status == 1
        );
        
        const absenShiftMasuk = dataAbsenMinimalDate.filter(
                data=>data.status == 4
            );
        
        const absenShiftPulang = dataAbsenMinimalDate.filter(
                data=>data.status == 5
            );

        // console.log(datas, 'data finger');

        const dataBersih = [];

        const dataKotor = [{dataSudahAbsen, dataNotFound, dataDouble, dataDelete}]

        //submit absen masuk
        const codeMasuk = [0, 8];

        //submit absen masuk
        await Promise.all(absenMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);
            
            dataBersih.push(user, 'user');

            if(!user){
                // console.log('user not found 1')
            }
            else{

                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    // console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codeMasuk
                    });

                    

                    //jika belum absen
                    if(!inOut){
                        //delete data tidak absen jika ada

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
                                userId:user.id,
                                tanggalMulai:
                                {
                                    [Op.and]: {
                                        [Op.gte]: dateFormat + ' 00:00:00',
                                        [Op.lte]: dateFormat + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: [11]}
                                }
                            }
                        });

                        if(findDataTidakAbsenDouble.length > 0){
                            await findDataTidakAbsenDouble[0].destroy();
                        }

                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            jamOperasionalGroupId:user.jam_operasional_group.id
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });

                            dataDouble.push(jamOperasionalTerakhir);

                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasionalTerakhir[0].id,
                            })
                        }

                        //jika absen normal
                        else{
                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataSudahAbsen.push(inOut, 'sudah absen');
                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codeMasuk}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'masuk' , findDataOutDouble[1]);

                            await findDataOutDouble[1].destroy();

                        }

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:findDate + ' 00:00:00'
                                // {
                                //     [Op.and]: {
                                //         [Op.gte]: findDate + ' 00:00:00',
                                //         [Op.lte]: findDate + ' 23:59:59',
                                //     }
                                // }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: [11]}
                                }
                            }
                        });

                        if(findDataTidakAbsenDouble.length > 0){
                            await findDataTidakAbsenDouble[0].destroy();
                        }
                    }
                }
            }
        }));

        // //submit absen pulang
        const codePulang = [1, 9];

        await Promise.all(absenPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);

            if(!user){
                console.log('user not found 1')
            }
            else{
                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codePulang
                    });

                    //jika belum absen
                    if(!inOut){
                        const inCheck = await findIn({
                            userId:user.id,
                            tipeAbsenId:tipeAbsen.id,
                            tanggalMulai:data.time,
                            dateFormat:dateFormat,
                            code:codeMasuk
                        })

                        if(!inCheck){

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });
 
                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang < timeFormat){
                            
                                //cek ada data tidak absen atau tidak
                                const tidakAbsenCheck = await findIn({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    dateFormat:dateFormat,
                                    code:[11]
                                })

                                if(!tidakAbsenCheck){
                                    await uploadAbsen({
                                        userId:user.id,
                                        tipeAbsenId:tidakAbsen.id,
                                        tanggalMulai:dateFormat + ' 00:00:00',
                                        tanggalSelesai:dateFormat + ' 00:00:00',
                                        pelanggaranId:2,
                                        statusInoutId:1,
                                        jamOperasionalId:jamOperasionalTerakhir[0].id,
                                    })
                                }

                                await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                // dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                //cek ada data tidak absen atau tidak
                                const tidakAbsenCheck = await findIn({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    dateFormat:dateFormat,
                                    code:[11]
                                })

                                if(!tidakAbsenCheck){
                                    await uploadAbsen({
                                        userId:user.id,
                                        tipeAbsenId:tidakAbsen.id,
                                        tanggalMulai:dateFormat + ' 00:00:00',
                                        tanggalSelesai:dateFormat + ' 00:00:00',
                                        pelanggaranId:2,
                                        statusInoutId:1,
                                        jamOperasionalId:jamOperasionalTerakhir[0].id,
                                    })
                                }
                            
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                        }
                        else{
                            // dataDelete.push(inCheck, 'in check');
                            
                            if(inCheck.jam_operasional.jamPulang < timeFormat){
                                const uploadAbsenNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:inCheck.jamOperasionalId,
                                });
                            }
                            else{
                                const uploadAbsenNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:inCheck.jamOperasionalId,
                                })
                            }
                            
                        }
                    }
                    //jika sudah ada absen
                    else{

                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'pulang' , findDataOutDouble[0]);

                            await findDataOutDouble[0].destroy();
                        }

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: dateFormat + ' 00:00:00',
                                        [Op.lte]: dateFormat + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: [11]}
                                }
                            }
                        });

                        if(findDataTidakAbsenDouble.length > 1){
                            
                            dataDouble.push(findDataTidakAbsenDouble, 'pulang' , findDataTidakAbsenDouble[0]);

                            await findDataTidakAbsenDouble[0].destroy();
                        }
                    }
                }
            }

        }));

        //submit absen masuk
        const codeShiftMasuk = [4];

        //submit absen masuk
        await Promise.all(absenShiftMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);
            
            dataBersih.push(user, 'user');

            if(!user){
                // console.log('user not found 1')
            }
            else{

                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    // console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codeShiftMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            jamOperasionalGroupId:user.jam_operasional_group.id
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });

                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasionalTerakhir[0].id,
                            })
                        }

                        //jika absen normal
                        else{
                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            // dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataSudahAbsen.push(inOut, 'sudah absen');
                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codeShiftMasuk}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'masuk' , findDataOutDouble[1]);

                            await findDataOutDouble[1].destroy();
                        }
                    }
                }
            }
        }));

        //submit absen shift pulang
        const codeShiftPulang = [5];

        //submit absen masuk
        await Promise.all(absenShiftPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);
            
            dataBersih.push(user, 'user');

            if(!user){
                // console.log('user not found 1')
            }
            else{

                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    // console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codeShiftPulang
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            jamOperasionalGroupId:user.jam_operasional_group.id
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });

                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasionalTerakhir[0].id,
                            })
                        }

                        //jika absen normal
                        else{
                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            // dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataSudahAbsen.push(inOut, 'sudah absen');
                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codeShiftPulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'masuk' , findDataOutDouble[1]);

                            await findDataOutDouble[1].destroy();
                        }
                    }
                }
            }
        }));

        return res.status(200).json({dataDouble});
    } catch (error) {
        return res.status(500).json({error});
    }

}

export const getDataMesinAbsenByCron = async(ip, day) => {

    console.log('get mesin absen by ip', ip);

    //find user
    async function findUser(pin){
        const response = await Users.findOne({
            where:{
                absenId:pin
            },
            include:[
                {
                    model:JamOperasionalGroup,
                    attributes:['id','code']
                }
            ],
            attributes:['id','absenId']
        });
        return response;
    }

    //find tipe absen
    async function findTipeAbsen(code){
        const response = await TipeAbsen.findOne({
            where:{
                code:code
            }
        })
        return response;
    }

    //find in
    async function findIn(data){
        const response = await InOut.findOne({
            where:{
                userId:data.userId,
                // tipeAbsenId:data.tipeAbsenId,
                tanggalMulai:{
                    [Op.and]: {
                        [Op.gte]: data.dateFormat + ' 00:00:00',
                        [Op.lte]: data.dateFormat + ' 23:59:59',
                    }
                }
            },
            include:[{
                    model:TipeAbsen,
                    where:{
                        code: { [Op.in]: data.code }
                    }
                },
                {
                    model:JamOperasional
                }
            ]
        })

        return response
    }

    //find in out
    async function findInOut(data){
        const response = await InOut.findOne({
            where:{
                userId:data.userId,
                // tipeAbsenId:data.tipeAbsenId,
                tanggalMulai:{
                    [Op.and]: {
                        [Op.gte]: data.dateFormat + ' 00:00:00',
                        [Op.lte]: data.dateFormat + ' 23:59:59',
                    }
                },
            },
            include:[{
                model:TipeAbsen,
                where:{
                    code: { [Op.in]: data.code}
                }
            },{
                model:Users
            }]
        })
        // console.log(response, 'find in out');
        return response
    }

    //find jam operasioanl by id
    // async function findJamOperasionalById(id){
    //     const response = await JamOperasional.findOne({
    //         where:{
    //             id:id
    //         }
    //     })

    //     return response;
    // }

    //find jam operasioanl
    async function findJamOperasionals(data){
        const response = await JamOperasional.findOne({
            where:{
                jamMasuk:{ [Op.gte]: data.timeFormat },
                // code:data.code
                jamOperasionalGroupId:data.jamOperasionalGroupId
            }
        })

        return response;
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhir(data) {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                // code:1
                jamOperasionalGroupId:data.jamOperasionalGroupId
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

    // //find jam operasional terkahir digunakan jika tidak absen masuk
    // async function jamOperasionalsTerakhirCode(code) {
    //     const response = await JamOperasional.findAll({
    //         limit:1,
    //         where:{
    //             // tipeAbsenId:1,
    //             code:code
    //         },
    //         order: [ [ 'createdAt', 'DESC' ]]
    //     });

    //     return response
    // }

    //upload absen
    async function uploadAbsen(data){
        const response = await InOut.create({
            userId:data.userId,
            tipeAbsenId:data.tipeAbsenId,
            tanggalMulai:data.tanggalMulai,
            tanggalSelesai:data.tanggalSelesai,
            pelanggaranId:data.pelanggaranId,
            statusInoutId:data.statusInoutId,
            jamOperasionalId:data.jamOperasionalId,
        });

        return response
    }

    
    //array data
    const dataSudahAbsen = [];
    const dataNotFound = [];
    const dataDouble = [];
    const dataDelete = [];

    try {
        const dataAbsen = await FingerprintSolution.download(ip, []);
        
        //batas minimal date untuk filter data
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - day);
        const minimalDate = date.format(dateNow, 'YYYY-MM-DD HH:mm:ss');

        const dataAbsenMinimalDate = dataAbsen.filter(
                data=>data.time > minimalDate
            );

        const absenMasuk = dataAbsenMinimalDate.filter(
                data=>data.status == 0
            );

        const absenPulang = dataAbsenMinimalDate.filter(
                data=>data.status == 1
        );
        
        const absenShiftMasuk = dataAbsenMinimalDate.filter(
                data=>data.status == 4
            );
        
        const absenShiftPulang = dataAbsenMinimalDate.filter(
                data=>data.status == 5
            );

        // console.log(datas, 'data finger');

        const dataBersih = [];

        const dataKotor = [{dataSudahAbsen, dataNotFound, dataDouble, dataDelete}]

        //submit absen masuk
        const codeMasuk = [0, 8];

        //submit absen masuk
        await Promise.all(absenMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);
            
            dataBersih.push(user, 'user');

            if(!user){
                // console.log('user not found 1')
            }
            else{

                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    // console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codeMasuk
                    });

                    

                    //jika belum absen
                    if(!inOut){
                        //delete data tidak absen jika ada

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
                                userId:user.id,
                                tanggalMulai:
                                {
                                    [Op.and]: {
                                        [Op.gte]: dateFormat + ' 00:00:00',
                                        [Op.lte]: dateFormat + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: [11]}
                                }
                            }
                        });

                        if(findDataTidakAbsenDouble.length > 0){
                            await findDataTidakAbsenDouble[0].destroy();
                        }

                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            jamOperasionalGroupId:user.jam_operasional_group.id
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });

                            dataDouble.push(jamOperasionalTerakhir);

                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasionalTerakhir[0].id,
                            })
                        }

                        //jika absen normal
                        else{
                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataSudahAbsen.push(inOut, 'sudah absen');
                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codeMasuk}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'masuk' , findDataOutDouble[1]);

                            await findDataOutDouble[1].destroy();

                        }

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:findDate + ' 00:00:00'
                                // {
                                //     [Op.and]: {
                                //         [Op.gte]: findDate + ' 00:00:00',
                                //         [Op.lte]: findDate + ' 23:59:59',
                                //     }
                                // }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: [11]}
                                }
                            }
                        });

                        if(findDataTidakAbsenDouble.length > 0){
                            await findDataTidakAbsenDouble[0].destroy();
                        }
                    }
                }
            }
        }));

        // //submit absen pulang
        const codePulang = [1, 9];

        await Promise.all(absenPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);

            if(!user){
                console.log('user not found 1')
            }
            else{
                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codePulang
                    });

                    //jika belum absen
                    if(!inOut){
                        const inCheck = await findIn({
                            userId:user.id,
                            tipeAbsenId:tipeAbsen.id,
                            tanggalMulai:data.time,
                            dateFormat:dateFormat,
                            code:codeMasuk
                        })

                        if(!inCheck){

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });
 
                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang < timeFormat){
                            
                                //cek ada data tidak absen atau tidak
                                const tidakAbsenCheck = await findIn({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    dateFormat:dateFormat,
                                    code:[11]
                                })

                                if(!tidakAbsenCheck){
                                    await uploadAbsen({
                                        userId:user.id,
                                        tipeAbsenId:tidakAbsen.id,
                                        tanggalMulai:dateFormat + ' 00:00:00',
                                        tanggalSelesai:dateFormat + ' 00:00:00',
                                        pelanggaranId:2,
                                        statusInoutId:1,
                                        jamOperasionalId:jamOperasionalTerakhir[0].id,
                                    })
                                }

                                await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                // dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                //cek ada data tidak absen atau tidak
                                const tidakAbsenCheck = await findIn({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    dateFormat:dateFormat,
                                    code:[11]
                                })

                                if(!tidakAbsenCheck){
                                    await uploadAbsen({
                                        userId:user.id,
                                        tipeAbsenId:tidakAbsen.id,
                                        tanggalMulai:dateFormat + ' 00:00:00',
                                        tanggalSelesai:dateFormat + ' 00:00:00',
                                        pelanggaranId:2,
                                        statusInoutId:1,
                                        jamOperasionalId:jamOperasionalTerakhir[0].id,
                                    })
                                }
                            
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                        }
                        else{
                            // dataDelete.push(inCheck, 'in check');
                            
                            if(inCheck.jam_operasional.jamPulang < timeFormat){
                                const uploadAbsenNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:inCheck.jamOperasionalId,
                                });
                            }
                            else{
                                const uploadAbsenNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:inCheck.jamOperasionalId,
                                })
                            }
                            
                        }
                    }
                    //jika sudah ada absen
                    else{

                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'pulang' , findDataOutDouble[0]);

                            await findDataOutDouble[0].destroy();
                        }

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: dateFormat + ' 00:00:00',
                                        [Op.lte]: dateFormat + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: [11]}
                                }
                            }
                        });

                        if(findDataTidakAbsenDouble.length > 1){
                            
                            dataDouble.push(findDataTidakAbsenDouble, 'pulang' , findDataTidakAbsenDouble[0]);

                            await findDataTidakAbsenDouble[0].destroy();
                        }
                    }
                }
            }

        }));

        //submit absen masuk
        const codeShiftMasuk = [4];

        //submit absen masuk
        await Promise.all(absenShiftMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);
            
            dataBersih.push(user, 'user');

            if(!user){
                // console.log('user not found 1')
            }
            else{

                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    // console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codeShiftMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            jamOperasionalGroupId:user.jam_operasional_group.id
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });

                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasionalTerakhir[0].id,
                            })
                        }

                        //jika absen normal
                        else{
                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            // dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataSudahAbsen.push(inOut, 'sudah absen');
                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codeShiftMasuk}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'masuk' , findDataOutDouble[1]);

                            await findDataOutDouble[1].destroy();
                        }
                    }
                }
            }
        }));

        //submit absen shift pulang
        const codeShiftPulang = [5];

        //submit absen masuk
        await Promise.all(absenShiftPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const timeFormat = date.format(timeFind, 'HH:mm:ss');
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

            //cari data user
            const user = await findUser(data.pin);
            
            dataBersih.push(user, 'user');

            if(!user){
                // console.log('user not found 1')
            }
            else{

                //cari tipe absen
                const tipeAbsen = await findTipeAbsen(data.status);

                if(!tipeAbsen){
                    // console.log('tipe not found 1')
                }
                else{
                    //cari data absen jika sudah absen
                    const inOut = await findInOut({
                        userId:user.id,
                        tipeAbsenId:tipeAbsen.id,
                        tanggalMulai:data.time,
                        dateFormat:dateFormat,
                        code:codeShiftPulang
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            jamOperasionalGroupId:user.jam_operasional_group.id
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir({
                                jamOperasionalGroupId:user.jam_operasional_group.id
                            });

                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasionalTerakhir[0].id,
                            })
                        }

                        //jika absen normal
                        else{
                            await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            // dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataSudahAbsen.push(inOut, 'sudah absen');
                        const tanggalMulai = new Date(inOut.tanggalMulai);

                        const findDate = date.format(tanggalMulai, "YYYY-MM-DD");

                        const findDataOutDouble = await InOut.findAll({
                            where:{
                                userId:inOut.userId,
                                tanggalMulai:{
                                    [Op.and]: {
                                        [Op.gte]: findDate + ' 00:00:00',
                                        [Op.lte]: findDate + ' 23:59:59',
                                    }
                                }
                            },
                            include:{
                                model:TipeAbsen,
                                where:{
                                    code: { [Op.in]: codeShiftPulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            
                            dataDouble.push(findDataOutDouble, 'masuk' , findDataOutDouble[1]);

                            await findDataOutDouble[1].destroy();
                        }
                    }
                }
            }
        }));

        console.log('success'+ip);
    } catch (error) {
        console.log(error.data);
    }

}