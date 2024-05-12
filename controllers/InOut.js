import InOut from "../models/InOutModal.js";
import Pelanggaran from "../models/PelanggaranModal.js";
import TipeAbsen from "../models/TipeAbsenModal.js";
import Users from "../models/UsersModel.js";
import { FingerprintSolution } from "fingerprint-solution";
import date from 'date-and-time';
import { Op } from "sequelize";
import JamOperasional from "../models/JamOperasionalModal.js";

// get data finger mesin

export const getDataFinger = async(req, res) => {
    const dataZonk = [];
    const dataBelumAbsen = [];
    const dataBelumAbsenMasuk = [];
    const dataBelumAbsenPulang = [];
    const dataSudahAbsen = [];

    try {
        const datas = await FingerprintSolution.download('202.152.5.198:8070', []);
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - 14);
        const min = date.format(dateNow, 'YYYY-MM-DD HH:mm:ss');

        const absenMasuk = datas.filter(
            data=>
            data.status == 0 &&
            data.time > min
            );

        const absenPulang = datas.filter(
            data=>
            data.status == 1 &&
            data.time > min
            );

        //submit absen masuk
        await Promise.all(absenMasuk.map(async (data)=>{
            const findUser = await Users.findOne({
                where:{
                    absenId:data.pin
                }
            });

            if(findUser === null){
                console.log(data.pin, 'id user tidak di temukan di sistem');
                dataZonk.push(data.pin);
            }
            else{
                const findTipeAbsen = await TipeAbsen.findOne({
                    where:{
                        code:data.status
                    }
                })
    
                const findInOut = await InOut.findOne({
                    where:{
                        userId:findUser.id,
                        tipeAbsenId:findTipeAbsen.id,
                        tanggalMulai:data.time
                    }
                })
    
                if(findInOut === null){
                    
                    const timeFind = new Date(data.time);
                    const timeFormat = date.format(timeFind, 'HH:mm:ss');
                    const dateTimeFormat = date.format(timeFind, 'YYYY-MM-DD HH:mm:ss');

                    const findJamOperasionals = await JamOperasional.findOne({
                        where:{
                            jamMasuk:{ [Op.gte]: timeFormat },
                            code:1
                        }
                    })

                    const findJamOperasionalsTerakhir = await JamOperasional.findAll({
                        limit:1,
                        where:{
                            tipeAbsenId:1,
                            code:1
                        },
                        order: [ [ 'createdAt', 'DESC' ]]
                    });

                    if(findJamOperasionals !== null){
                        const uploadAbsen = await InOut.create({
                            userId:findUser.id,
                            tipeAbsenId:findTipeAbsen.id,
                            tanggalMulai:data.time,
                            tanggalSelesai:data.time,
                            pelanggaranId:1,
                            statusInoutId:1,
                            jamOperasionalId:findJamOperasionals.id,
                        });
                    }
                    else{
                        if(timeFormat > findJamOperasionalsTerakhir[0].jamMasuk){
                            const uploadAbsen = await InOut.create({
                                userId:findUser.id,
                                tipeAbsenId:findTipeAbsen.id,
                                tanggalMulai:data.time,
                                tanggalSelesai:data.time,
                                pelanggaranId:2,
                                statusInoutId:1,
                                jamOperasionalId:findJamOperasionalsTerakhir[0].id
                            });
                        }
                        else{
                            const uploadAbsen = await InOut.create({
                                userId:findUser.id,
                                tipeAbsenId:findTipeAbsen.id,
                                tanggalMulai:data.time,
                                tanggalSelesai:data.time,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:findJamOperasionalsTerakhir[0].id
                            });
                        }
                    }

                    dataBelumAbsenMasuk.push(data, timeFormat, dateTimeFormat, findJamOperasionals, findJamOperasionalsTerakhir[0].id);

                    
                }
                else{
                    dataSudahAbsen.push(findInOut);
                }
            }
        }));

        //submit absen pulang
        await Promise.all(absenPulang.map(async (data)=>{
            const findUser = await Users.findOne({
                where:{
                    absenId:data.pin
                }
            });

            const findTipeAbsen = await TipeAbsen.findOne({
                where:{
                    code:data.status
                }
            })

            if(findUser === null){
                console.log(data.pin, 'id user tidak di temukan di sistem');
                dataZonk.push(data.pin);
            }
            else{
                const dateFind = new Date(data.time);
                const timeFormat = date.format(dateFind, 'HH:mm:ss');
                const dateFormat = date.format(dateFind, 'YYYY-MM-DD');

                const findIn = await InOut.findOne({
                    where:{
                        tanggalMulai:{
                            [Op.and]: {
                                [Op.gte]: dateFormat + ' 00:00:00',
                                [Op.lte]: dateFormat + ' 23:59:59',
                                }
                        }
                    }
                })

                const findInOut = await InOut.findOne({
                    where:{
                        userId:findUser.id,
                        tipeAbsenId:findTipeAbsen.id,
                        tanggalMulai:data.time
                    }
                })

                const findJamOperasionalsTerakhir = await JamOperasional.findAll({
                    limit:1,
                    where:{
                        // tipeAbsenId:1,
                        code:'1'
                    },
                    order: [ [ 'createdAt', 'DESC' ]]
                });

                if(findInOut !== null){
                    console.log('sudah absen');
                }
                else{
                    dataBelumAbsenPulang.push(data, dateFormat, findIn);

                    if(findIn === null){
                        
                        //mencari id tipe absen code 9 (tipe tidak absen masuk)
                        const tipeTidakAbsen = await TipeAbsen.findOne({
                            where:{
                                code:9
                            }
                        })

                        //tidak absen masuk -> upload absen type 9 (tidak absen masuk)
                        await InOut.create({
                            userId:findUser.id,
                            tipeAbsenId:tipeTidakAbsen.id,
                            tanggalMulai:dateFormat + ' 00:00:00',
                            tanggalSelesai:dateFormat + ' 00:00:00',
                            pelanggaranId:2,
                            statusInoutId:1,
                            jamOperasionalId:findJamOperasionalsTerakhir[0].id
                        });
                        
                        //tidak ditemukan absen masuk -> upload absen pulang
                        await InOut.create({
                            userId:findUser.id,
                            tipeAbsenId:findTipeAbsen.id,
                            tanggalMulai:data.time,
                            tanggalSelesai:data.time,
                            pelanggaranId:1,
                            statusInoutId:1,
                            jamOperasionalId:findJamOperasionalsTerakhir[0].id
                        });
                    }
                    else{
                        //absen masuk ditemukan -> upload absen pulang 
                        await InOut.create({
                            userId:findUser.id,
                            tipeAbsenId:findTipeAbsen.id,
                            tanggalMulai:data.time,
                            tanggalSelesai:data.time,
                            pelanggaranId:1,
                            statusInoutId:1,
                            jamOperasionalId:findIn.jamOperasionalId
                        });
                    }
                }

            }
        }));

        res.status(200).json({msg: "success", dataZonk, dataBelumAbsen, dataBelumAbsenMasuk, dataBelumAbsenPulang, dataSudahAbsen});
    } catch (error) {
        return res.status(500).json({msg : error});
    }
}

export const testInOut = async(ip) => {
    const dataExist = [];
    const dataNotFound = [];
    const dataDouble = [];
    const dataDelete = [];

    //find user
    async function findUser(pin){
        const response = await Users.findOne({
            where:{
                absenId:pin
            }
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
            include:{
                model:TipeAbsen,
                where:{
                    code: { [Op.in]: data.code }
                }
            }
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
            include:{
                model:TipeAbsen,
                where:{
                    code: { [Op.in]: data.code}
                }
            }
        })
        console.log(response, 'find in out');
        return response
    }

    //find jam operasioanl by id
    async function findJamOperasionalById(id){
        const response = await JamOperasional.findOne({
            where:{
                id:id
            }
        })

        return response;
    }

    //find jam operasioanl
    async function findJamOperasionals(data){
        const response = await JamOperasional.findOne({
            where:{
                jamMasuk:{ [Op.gte]: data.timeFormat },
                code:data.code
            }
        })

        return response;
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhir() {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                code:1
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhirCode(code) {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                code:code
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

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

    try {
        const datas = await FingerprintSolution.download(ip, []);
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - 30);
        const min = date.format(dateNow, 'YYYY-MM-DD HH:mm:ss');

        const absenMasuk = datas.filter(
            data=>
            data.status == 0 &&
            data.time > min
            );

        const absenPulang = datas.filter(
            data=>
            data.status == 1 &&
            data.time > min
            );
        
        const absenShiftMasuk = datas.filter(
            data=>
            data.status == 4 &&
            data.time > min
            );
        
        const absenShiftPulang = datas.filter(
            data=>
            data.status == 5 &&
            data.time > min
            );
        
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
                        code:codeMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            code:1
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir();

                            const uploadAbsenNormal = await uploadAbsen({
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
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataExist.push(inOut, 'sudah absen tipe absen id database');
                    }
                }
            }
        }));

        //submit absen pulang
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
                            dataNotFound.push(data.time, data.status, 'tidak ada absen masuk 29');

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir();

                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang < timeFormat){
                                const uploadAbsenTidakMasuk = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    tanggalSelesai:dateFormat + ' 00:00:00',
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })

                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                const uploadAbsenTidakMasuk = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    tanggalSelesai:dateFormat + ' 00:00:00',
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })

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
                            dataDelete.push(inCheck, 'in check');
                            
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
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //submit absen shift masuk
        const codeShiftMasuk = [4];

        await Promise.all(absenShiftMasuk.map(async (data)=>{
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
                        code:codeShiftMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            code:2
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhirCode(2);

                            const uploadAbsenNormal = await uploadAbsen({
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
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataExist.push(inOut, 'sudah absen tipe absen id database');
                    }
                }
            }
        }));

        //submit absen shift pulang
        const codeShiftPulang = [5];

        await Promise.all(absenShiftPulang.map(async (data)=>{
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
                        code:codeShiftPulang
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
                            dataNotFound.push(data.time, data.status, 'tidak ada absen masuk 29');

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhirCode(2);

                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang < timeFormat){
                                
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                        }
                        else{
                            dataDelete.push(inCheck, 'in check');
                            
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:2,
                                jamOperasionalId:inCheck.jamOperasionalId,
                            })
                        }
                    }
                    //jika sudah ada absen
                    else{
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }));

        //filter absen masuk
        await Promise.all(absenMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen pulang
        await Promise.all(absenPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen shift masuk
        await Promise.all(absenShiftMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeShiftMasuk
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeShiftMasuk}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen shift pulang
        await Promise.all(absenShiftPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeShiftPulang
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeShiftPulang}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

    } catch (error) {
        console.log(error);
    }
}


//get data finger yang clean
export const getDataByFinger = async(req, res) => {
    const dataExist = [];
    const dataNotFound = [];
    const dataDouble = [];
    const dataDelete = [];

    //find user
    async function findUser(pin){
        const response = await Users.findOne({
            where:{
                absenId:pin
            }
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
            include:{
                model:TipeAbsen,
                where:{
                    code: { [Op.in]: data.code}
                }
            }
        })
        console.log(response, 'find in out');
        return response
    }

    //find jam operasioanl by id
    async function findJamOperasionalById(id){
        const response = await JamOperasional.findOne({
            where:{
                id:id
            }
        })

        return response;
    }

    //find jam operasioanl
    async function findJamOperasionals(data){
        const response = await JamOperasional.findOne({
            where:{
                jamMasuk:{ [Op.gte]: data.timeFormat },
                code:data.code
            }
        })

        return response;
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhir() {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                code:1
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhirCode(code) {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                code:code
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

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

    try {
        const datas = await FingerprintSolution.download('103.160.12.10', []);
        // console.log(datas.status, 'data finger');

        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - 30);
        const min = date.format(dateNow, 'YYYY-MM-DD HH:mm:ss');

        const absenMasuk = datas.filter(
            data=>
            data.status == 0 &&
            data.time > min
            );

        const absenPulang = datas.filter(
            data=>
            data.status == 1 &&
            data.time > min
            );
        
        const absenShiftMasuk = datas.filter(
            data=>
            data.status == 4 &&
            data.time > min
            );
        
        const absenShiftPulang = datas.filter(
            data=>
            data.status == 5 &&
            data.time > min
            );
        
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
                        code:codeMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            code:1
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir();

                            const uploadAbsenNormal = await uploadAbsen({
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
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataExist.push(inOut, 'sudah absen tipe absen id database');
                    }
                }
            }
        }));

        //submit absen pulang
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
                            dataNotFound.push(data.time, data.status, 'tidak ada absen masuk 29');

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir();

                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang < timeFormat){
                                const uploadAbsenTidakMasuk = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    tanggalSelesai:dateFormat + ' 00:00:00',
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })

                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                const uploadAbsenTidakMasuk = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    tanggalSelesai:dateFormat + ' 00:00:00',
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })

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
                            dataDelete.push(inCheck, 'in check');
                            
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
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //submit absen shift masuk
        const codeShiftMasuk = [4];

        await Promise.all(absenShiftMasuk.map(async (data)=>{
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
                        code:codeShiftMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            code:2
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhirCode(2);

                            const uploadAbsenTelat = await uploadAbsen({
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
                            
                            if(jamOperasional.jamMasuk < timeFormat){

                                const uploadAbsenNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasional.id,
                                })
    
                                dataNotFound.push(jamOperasional, 'jam operasional');
                            }
                            else{
                                const uploadAbsenNormal = await uploadAbsen({
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
                    }

                    // jika sudah absen
                    else{
                        // dataExist.push(inOut, 'sudah absen tipe absen id database');
                    }
                }
            }
        }));

        //submit absen shift pulang
        const codeShiftPulang = [5];

        await Promise.all(absenShiftPulang.map(async (data)=>{
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
                        code:codeShiftPulang
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
                            dataNotFound.push(data.time, data.status, 'tidak ada absen masuk 29');

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhirCode(2);

                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang > timeFormat){
                                
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                        }
                        else{
                            
                            
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:2,
                                jamOperasionalId:inCheck.jamOperasionalId,
                            })
                        }
                    }
                    //jika sudah ada absen
                    else{
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }));

        //filter absen masuk
        await Promise.all(absenMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeMasuk
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeMasuk}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen pulang
        await Promise.all(absenPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
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

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }

                        if(findDataTidakAbsenDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataTidakAbsenDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen shift masuk
        await Promise.all(absenShiftMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeShiftMasuk
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeShiftMasuk}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen shift pulang
        await Promise.all(absenShiftPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeShiftPulang
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeShiftPulang}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))
        

        return res.status(200).json({dataNotFound, dataExist, dataDouble, dataDelete});
    } catch (error) {
        return res.status(500).json({msg: error.msg});
    }
}

//get data finger 2 yang clean
export const getDataByFingerByCron = async(ip) => {
    console.log(ip, 'sampai data tarik');

    const dataExist = [];
    const dataNotFound = [];
    const dataDouble = [];
    const dataDelete = [];

    //find user
    async function findUser(pin){
        const response = await Users.findOne({
            where:{
                absenId:pin
            }
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
            include:{
                model:TipeAbsen,
                where:{
                    code: { [Op.in]: data.code}
                }
            }
        })
        console.log(response, 'find in out');
        return response
    }

    //find jam operasioanl by id
    async function findJamOperasionalById(id){
        const response = await JamOperasional.findOne({
            where:{
                id:id
            }
        })

        return response;
    }

    //find jam operasioanl
    async function findJamOperasionals(data){
        const response = await JamOperasional.findOne({
            where:{
                jamMasuk:{ [Op.gte]: data.timeFormat },
                code:data.code
            }
        })

        return response;
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhir() {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                code:1
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

    //find jam operasional terkahir digunakan jika tidak absen masuk
    async function jamOperasionalsTerakhirCode(code) {
        const response = await JamOperasional.findAll({
            limit:1,
            where:{
                // tipeAbsenId:1,
                code:code
            },
            order: [ [ 'createdAt', 'DESC' ]]
        });

        return response
    }

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

    try {
        const datas = await FingerprintSolution.download(ip, []);
        console.log(datas, 'data finger');

        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() - 30);
        const min = date.format(dateNow, 'YYYY-MM-DD HH:mm:ss');

        const absenMasuk = datas.filter(
            data=>
            data.status == 0 &&
            data.time > min
            );

        const absenPulang = datas.filter(
            data=>
            data.status == 1 &&
            data.time > min
            );
        
        const absenShiftMasuk = datas.filter(
            data=>
            data.status == 4 &&
            data.time > min
            );
        
        const absenShiftPulang = datas.filter(
            data=>
            data.status == 5 &&
            data.time > min
            );
        
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
                        code:codeMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            code:1
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir();

                            const uploadAbsenNormal = await uploadAbsen({
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
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:1,
                                jamOperasionalId:jamOperasional.id,
                            })

                            dataNotFound.push(dateTimeFormat, 'belum absen absen');
                        }
                    }

                    // jika sudah absen
                    else{
                        // dataExist.push(inOut, 'sudah absen tipe absen id database');
                    }
                }
            }
        }));

        //submit absen pulang
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
                            dataNotFound.push(data.time, data.status, 'tidak ada absen masuk 29');

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhir();

                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang < timeFormat){
                                const uploadAbsenTidakMasuk = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    tanggalSelesai:dateFormat + ' 00:00:00',
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })

                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenTidakMasuk, uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                const uploadAbsenTidakMasuk = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tidakAbsen.id,
                                    tanggalMulai:dateFormat + ' 00:00:00',
                                    tanggalSelesai:dateFormat + ' 00:00:00',
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })

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
                            dataDelete.push(inCheck, 'in check');
                            
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
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //submit absen shift masuk
        const codeShiftMasuk = [4];

        await Promise.all(absenShiftMasuk.map(async (data)=>{
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
                        code:codeShiftMasuk
                    });

                    //jika belum absen
                    if(!inOut){
                        const jamOperasional = await findJamOperasionals({
                            timeFormat:timeFormat, 
                            code:2
                        });

                        //jika telat
                        if(!jamOperasional){
                            const jamOperasionalTerakhir = await jamOperasionalsTerakhirCode(2);

                            const uploadAbsenTelat = await uploadAbsen({
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
                            
                            if(jamOperasional.jamMasuk < timeFormat){

                                const uploadAbsenNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasional.id,
                                })
    
                                dataNotFound.push(jamOperasional, 'jam operasional');
                            }
                            else{
                                const uploadAbsenNormal = await uploadAbsen({
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
                    }

                    // jika sudah absen
                    else{
                        // dataExist.push(inOut, 'sudah absen tipe absen id database');
                    }
                }
            }
        }));

        //submit absen shift pulang
        const codeShiftPulang = [5];

        await Promise.all(absenShiftPulang.map(async (data)=>{
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
                        code:codeShiftPulang
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
                            dataNotFound.push(data.time, data.status, 'tidak ada absen masuk 29');

                            const jamOperasionalTerakhir = await jamOperasionalsTerakhirCode(2);

                            const tidakAbsen = await findTipeAbsen(11);

                            //cek pulang dulu atau tidak
                            if(jamOperasionalTerakhir[0].jamPulang > timeFormat){
                                
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:1,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                            else{
                                const uploadAbsenPulangNormal = await uploadAbsen({
                                    userId:user.id,
                                    tipeAbsenId:tipeAbsen.id,
                                    tanggalMulai:dateTimeFormat,
                                    tanggalSelesai:dateTimeFormat,
                                    pelanggaranId:2,
                                    statusInoutId:1,
                                    jamOperasionalId:jamOperasionalTerakhir[0].id,
                                })
    
                                dataExist.push(uploadAbsenPulangNormal, 'absen pulang tidak masuk 29');
                            }
                        }
                        else{
                            
                            
                            const uploadAbsenNormal = await uploadAbsen({
                                userId:user.id,
                                tipeAbsenId:tipeAbsen.id,
                                tanggalMulai:dateTimeFormat,
                                tanggalSelesai:dateTimeFormat,
                                pelanggaranId:1,
                                statusInoutId:2,
                                jamOperasionalId:inCheck.jamOperasionalId,
                            })
                        }
                    }
                    //jika sudah ada absen
                    else{
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }));

        //filter absen masuk
        await Promise.all(absenMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeMasuk
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeMasuk}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen pulang
        await Promise.all(absenPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codePulang}
                                }
                            }
                        });

                        const findDataTidakAbsenDouble = await InOut.findAll({
                            where:{
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

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }

                        if(findDataTidakAbsenDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataTidakAbsenDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen shift masuk
        await Promise.all(absenShiftMasuk.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeShiftMasuk
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeShiftMasuk}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        //filter absen shift pulang
        await Promise.all(absenShiftPulang.map(async (data)=>{
            const timeFind = new Date(data.time);
            const dateFormat = date.format(timeFind, 'YYYY-MM-DD');
            
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
                        code:codeShiftPulang
                    });

                    //jika ada data
                    if(inOut !== null){
                        //cari data double untuk didelete
                        const findDataOutDouble = await InOut.findAll({
                            where:{
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
                                    code: { [Op.in]: codeShiftPulang}
                                }
                            }
                        });

                        //jika ada data double
                        if(findDataOutDouble.length > 1){
                            dataDouble.push(findDataOutDouble, 'pulang');
                            dataDelete.push(findDataOutDouble[0], 'delete')
                            
                            //delete data
                            await findDataOutDouble[0].destroy();
                        }
                    }
                }
            }

        }))

        console.log({dataNotFound, dataExist, dataDouble, dataDelete});
    } catch (error) {
        console.log(error.msg);
    }
}


//perhitungan by month
export const getDataByIdAndMonth = async(req, res)=>{
    const {id, tanggalMulai, tanggalSelesai} = req.params;
    // const date = new Date();

    const startDate = date.format(new Date(tanggalMulai), 'YYYY-MM-DD HH:mm:ss');
    const endDate = date.format(new Date(tanggalSelesai), 'YYYY-MM-DD HH:mm:ss');

    console.log('test');
    
    try {
        const findUser = await Users.findOne({
            where:{
                uuid:id
            }
        });

        if(!findUser) return res.statu(404).json({msg: 'user not found'});
        
        // console.log(startDate, endDate, 'tampilkan');

        const findInOut = await InOut.findAll({
            where:{
                userId:findUser.id,
                tanggalMulai:{
                    [Op.and]: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate,
                        }
                }
            },
            include:[
                {
                    model:TipeAbsen
                },
                {
                    model:Pelanggaran
                }
            ]
        })

        res.status(200).json(findInOut);
    } catch (error) {
        res.status(500).json(error);
    }
}