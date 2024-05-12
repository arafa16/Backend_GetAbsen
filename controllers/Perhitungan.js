import Group from "../models/GroupModal.js";
import InOut from "../models/InOutModal.js";
import PeriodeKerja from "../models/PeriodeKerjaModal.js";
import date from 'date-and-time';
import Users from "../models/UsersModel.js";
import { Op } from "sequelize";
import StatusInout from "../models/StatusInoutModal.js";
import Pelanggaran from "../models/PelanggaranModal.js";
import TipeAbsen from "../models/TipeAbsenModal.js";
import excelJs from 'exceljs';

export const getPerhitunganByGroupPeriode = async(req, res) => {
    const {idPeriode, idGroup} = req.params;
    const dataPerhitungan = [];
    const dataPerhitunganAkhir = [];
    
    const findPeriode = await PeriodeKerja.findOne({
        where:{
            uuid:idPeriode
        }
    });

    if(!findPeriode) return res.status(404).json({msg: "periode not found"});

    const findGroup = await Group.findOne({
        where:{
            uuid:idGroup
        }
    })

    if(!findGroup) return res.status(404).json({msg: "group not found"});

    try {
        const startDate = date.format(new Date(findPeriode.tanggalMulai), 'YYYY-MM-DD HH:mm:ss');
        const endDate = date.format(new Date(findPeriode.tanggalSelesai), 'YYYY-MM-DD HH:mm:ss');

        const findUser = await Users.findAll({
            where:{
                groupId:findGroup.id,
                isActive:true
            },
            attributes:['id','uuid','nik','name','groupId','isActive']
        });

        for(const data in findUser){
            dataPerhitungan.push(
                {
                    name : findUser[data].uuid,
                    nik:findUser[data].nik,
                    name:findUser[data].name,
                    groupId:findUser[data].groupId,
                    isActive:findUser[data].isActive,
                    dataIn:0,
                    dataInPelanggaran:0,
                    dataInNormal:0,
                    dataOut:0,
                    dataOutPelanggaran:0,
                    dataOutNormal:0,
                    dataTidakAbsen:0,
                }
            );

            const getDataInOut = await InOut.findAll({
                where:{
                    userId:findUser[data].id,
                    tanggalMulai:{
                        [Op.and]: {
                            [Op.gte]: startDate,
                            [Op.lte]: endDate,
                            }
                    }
                },
                attributes:['tanggalMulai', 'tanggalSelesai'],
                include:[  
                    {
                        model:TipeAbsen,
                        attributes:['name','code']
                    },
                    {
                        model:StatusInout,
                        attributes:['name','code']
                    },
                    {
                        model:Pelanggaran,
                        attributes:['name','code']
                    }
                ]
            })

            console.log(getDataInOut, 'data in out');

            for(const dataInOut in getDataInOut){
                if(getDataInOut[dataInOut].tipe_absen.code === '0'){
                    dataPerhitungan[data].dataIn = dataPerhitungan[data].dataIn + 1;
                    if(getDataInOut[dataInOut].pelanggaran.code === '2'){
                        dataPerhitungan[data].dataInPelanggaran = dataPerhitungan[data].dataInPelanggaran + 1;
                    }
                    else{
                        dataPerhitungan[data].dataInNormal = dataPerhitungan[data].dataInNormal + 1;
                    }
                }
                else if(getDataInOut[dataInOut].tipe_absen.code === '1'){
                    dataPerhitungan[data].dataOut = dataPerhitungan[data].dataOut + 1;
                    if(getDataInOut[dataInOut].pelanggaran.code === '2'){
                        dataPerhitungan[data].dataOutPelanggaran = dataPerhitungan[data].dataOutPelanggaran + 1;
                    }
                    else{
                        dataPerhitungan[data].dataOutNormal = dataPerhitungan[data].dataOutNormal + 1;
                    }
                }
                else{
                    dataPerhitungan[data].dataTidakAbsen = dataPerhitungan[data].dataTidakAbsen + 1;
                }
            }
            
        }

        // for(const data in dataPerhitungan){

        // }

        return res.status(200).json(dataPerhitungan);
    } catch (error) {
        return res.status(404).json({msg: error});
    }
}

export const exportPerhitunganByGroupPeriode = async(req, res) => {
    const {idPeriode, idGroup} = req.params;
    const dataPerhitungan = [];
    const dataPerhitunganAkhir = [];
    
    const findPeriode = await PeriodeKerja.findOne({
        where:{
            uuid:idPeriode
        }
    });

    if(!findPeriode) return res.status(404).json({msg: "periode not found"});

    const findGroup = await Group.findOne({
        where:{
            uuid:idGroup
        }
    })

    if(!findGroup) return res.status(404).json({msg: "group not found"});

    try {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("data perhitungan");

        const startDate = date.format(new Date(findPeriode.tanggalMulai), 'YYYY-MM-DD HH:mm:ss');
        const endDate = date.format(new Date(findPeriode.tanggalSelesai), 'YYYY-MM-DD HH:mm:ss');

        const findUser = await Users.findAll({
            where:{
                groupId:findGroup.id,
                isActive:true
            },
            attributes:['id','uuid','nik','name','groupId','isActive']
        });

        for(const data in findUser){
            dataPerhitungan.push(
                {
                    name : findUser[data].uuid,
                    nik:findUser[data].nik,
                    name:findUser[data].name,
                    groupId:findUser[data].groupId,
                    isActive:findUser[data].isActive,
                    dataIn:0,
                    dataInPelanggaran:0,
                    dataInNormal:0,
                    dataOut:0,
                    dataOutPelanggaran:0,
                    dataOutNormal:0,
                    dataTidakAbsen:0,
                }
            );

            const getDataInOut = await InOut.findAll({
                where:{
                    userId:findUser[data].id,
                    tanggalMulai:{
                        [Op.and]: {
                            [Op.gte]: startDate,
                            [Op.lte]: endDate,
                            }
                    }
                },
                attributes:['tanggalMulai', 'tanggalSelesai'],
                include:[  
                    {
                        model:TipeAbsen,
                        attributes:['name','code']
                    },
                    {
                        model:StatusInout,
                        attributes:['name','code']
                    },
                    {
                        model:Pelanggaran,
                        attributes:['name','code']
                    }
                ]
            })

            console.log(getDataInOut, 'data in out');

            for(const dataInOut in getDataInOut){
                if(getDataInOut[dataInOut].tipe_absen.code === '0'){
                    dataPerhitungan[data].dataIn = dataPerhitungan[data].dataIn + 1;
                    if(getDataInOut[dataInOut].pelanggaran.code === '2'){
                        dataPerhitungan[data].dataInPelanggaran = dataPerhitungan[data].dataInPelanggaran + 1;
                    }
                    else{
                        dataPerhitungan[data].dataInNormal = dataPerhitungan[data].dataInNormal + 1;
                    }
                }
                else if(getDataInOut[dataInOut].tipe_absen.code === '1'){
                    dataPerhitungan[data].dataOut = dataPerhitungan[data].dataOut + 1;
                    if(getDataInOut[dataInOut].pelanggaran.code === '2'){
                        dataPerhitungan[data].dataOutPelanggaran = dataPerhitungan[data].dataOutPelanggaran + 1;
                    }
                    else{
                        dataPerhitungan[data].dataOutNormal = dataPerhitungan[data].dataOutNormal + 1;
                    }
                }
                else{
                    dataPerhitungan[data].dataTidakAbsen = dataPerhitungan[data].dataTidakAbsen + 1;
                }
            }
            
        }

        sheet.columns= [
            {header : "No", key:"no", width: 25},
            {header : "Nama", key:"name", width: 25},
            {header : "NIK", key:"nik", width: 25},
            {header : "Masuk", key:"masuk", width: 25},
            {header : "Masuk Normal", key:"masunN", width: 25},
            {header : "Masuk Melanggar", key:"masukP", width: 25},
            {header : "Pulang", key:"pulang", width: 25},
            {header : "Pulang Normal", key:"pulangN", width: 25},
            {header : "Pulang Melanggar", key:"pulangP", width: 25},
            {header : "Tidak Absen", key:"tidakAbsen", width: 25},
            {header : "Total Pelanggaran", key:"totalP", width: 25},
            {header : "Point Pelanggaran", key:"pointP", width: 25},
        ];

        dataPerhitungan.map((value, index) =>{
            sheet.addRow({
                no:index+1,
                name:value.name,
                nik:value.nik,
                masuk:value.dataIn,
                masunN:value.dataInNormal,
                masukP:value.dataInPelanggaran,
                pulang:value.dataOut, 
                pulangN:value.dataOutNormal,
                pulangP:value.dataOutPelanggaran,
                tidakAbsen:value.dataTidakAbsen,
                totalP:(value.dataInPelanggaran + value.dataOutPelanggaran + value.dataTidakAbsen),
                pointP:((value.dataInPelanggaran + value.dataOutPelanggaran + value.dataTidakAbsen)*0.005),
            });
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment;filename="+"data_perhitungan.xlsx"
        );

        workbook.xlsx.write(res);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}
