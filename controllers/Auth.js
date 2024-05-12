import Status from "../models/StatusModel.js";
import Users from "../models/UsersModel.js";
import argon from 'argon2';
import Privilege from "../models/PrivilegeModal.js";
import token from 'jsonwebtoken';

export const Login = async(req, res) =>{
    const user = await Users.findOne({
        where:{
            email: req.body.email
        }
    });
    if(!user) return res.status(404).json({msg: "user not found"});

    const match = await argon.verify(user.password, req.body.password);
    if(!match) return res.status(401).json({msg: "password salah"});

    req.session.userId = user.uuid;
    
    const uuid = user.uuid;
    const name = user.name;
    const email = user.email;
    
    res.status(200).json({uuid, name, email});
}

export const register = async(req, res) => {
    const { nik,
            absenId, 
            name, 
            ganderId, 
            email,
            extention,
            nomorHp,
            penempatanId,
            jabatanId,
            atasanId,
            nomorKtp,
            alamatKtp,
            alamatDomisili,
            tempatLahir,
            tanggalLahir,
            nomorNpwp,
            statusPerkawinanId,
            jumlahAnak,
            namaIbu,
            pendidikanId,
            namaSekolah,
            jurusanSekolah,
            tahunLulus,
            ipk,
            nomorBpjsKesehatan,
            nomorBpjsKetenagakerjaan,
            contactEmergencyId,
            emergencyNumber,
            emergencyAddress,
            nomorSim,
            golonganDarahId,
            bankId,
            nomorRekening,
            jamOperasionalId,
            groupId,
            password,
            quote
        } = req.body;
    
    const hasPassword = await argon.hash(password);

    try {
        await Users.create({
            nik:nik,
            absenId:absenId,
            name:name, 
            ganderId:ganderId, 
            email:email,
            password:hasPassword,
            extention:extention,
            nomorHp:nomorHp,
            penempatanId:penempatanId,
            jabatanId:jabatanId,
            atasanId:atasanId,
            nomorKtp:nomorKtp,
            alamatKtp:alamatKtp,
            alamatDomisili:alamatDomisili,
            tempatLahir:tempatLahir,
            tanggalLahir:tanggalLahir,
            nomorNpwp:nomorNpwp,
            statusPerkawinanId:statusPerkawinanId,
            jumlahAnak:jumlahAnak,
            namaIbu:namaIbu,
            pendidikanId:pendidikanId,
            namaSekolah:namaSekolah,
            jurusanSekolah:jurusanSekolah,
            tahunLulus:tahunLulus,
            ipk:ipk,
            nomorBpjsKesehatan:nomorBpjsKesehatan,
            nomorBpjsKetenagakerjaan:nomorBpjsKetenagakerjaan,
            contactEmergencyId:contactEmergencyId,
            emergencyNumber:emergencyNumber,
            emergencyAddress:emergencyAddress,
            nomorSim:nomorSim,
            golonganDarahId:golonganDarahId,
            bankId:bankId,
            nomorRekening:nomorRekening,
            jamOperasionalId:jamOperasionalId,
            groupId:groupId,
            quote:quote
        });

        return res.status(201).json({msg: "success"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: error.message});
    }
}

export const getMe = async(req, res) => {

    if(!req.session.userId){
        return res.status(401).json({msg: "Silahkan login ke akun Anda"});
    }

    const user = await Users.findOne({
        where:{
            uuid:req.session.userId
        },
        attributes:[
            'uuid',
            'nik',
            'absenId',
            'name',
            'image',
            'url_image',
            'email',
            'isActive'
        ],
        include:[
            {
                model:Status,
                attributes:['uuid','name','code']
            },
            {
                model:Privilege
            }
        ]

    });

    if(!user) return res.status(404).json({msg: "user not found"});

    res.status(200).json(user);
}

export const Logout = async(req, res) => {
    req.session.destroy((err)=>{
        if(err) return res.status(400).json({msg: err.message});

        return res.status(200).json({msg: "logout success"});
    })
}