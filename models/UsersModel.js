import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import Status from './StatusModel.js';
import Penempatan from './PenempatanModel.js';
import Jabatan from './JabatanModal.js';
import Bank from './BankModal.js';
import JamOperasional from './JamOperasionalModal.js';
import StatusPerkawinan from './StatusPerkawinanModal.js';
import Pendidikan from './PendidikanModal.js';
import ContactEmergency from './ContactEmergencyModal.js';
import GolonganDarah from './GolonganDarahModel.js';
import Group from './GroupModal.js';
import Gander from './GanderModal.js';
import Privilege from './PrivilegeModal.js';
import JamOperasionalGroup from './JamOperasionalGroupModal.js';

const {DataTypes} = Sequelize;
 
const Users = db.define('users',{
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    absenId:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    nik:{
        type: DataTypes.STRING,
        allowNull:true
    },
    name:{
        type: DataTypes.STRING,
        allowNull:false
    },
    email:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true,
            isEmail: true
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    image:{
        type: DataTypes.STRING,
        allowNull:true
    },
    url_image:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    ganderId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    extention:{
        type: DataTypes.STRING,
        allowNull:true
    },
    nomorHp:{
        type: DataTypes.STRING,
        allowNull:true
    },
    penempatanId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    jabatanId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    atasanId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    nomorKtp:{
        type: DataTypes.STRING,
        allowNull:true
    },
    alamatKtp:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    alamatDomisili:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    tempatLahir:{
        type: DataTypes.STRING,
        allowNull:true
    },
    tanggalLahir:{
        type: DataTypes.DATE,
        allowNull:true
    },
    nomorNpwp:{
        type: DataTypes.STRING,
        allowNull:true
    },
    statusPerkawinanId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    jumlahAnak:{
        type: DataTypes.STRING,
        allowNull:true
    },
    namaIbu:{
        type: DataTypes.STRING,
        allowNull:true
    },
    pendidikanId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    namaSekolah:{
        type: DataTypes.STRING,
        allowNull:true
    },
    jurusanSekolah:{
        type: DataTypes.STRING,
        allowNull:true
    },
    tahunLulus:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    ipk:{
        type: DataTypes.STRING,
        allowNull:true
    },
    nomorBpjsKesehatan:{
        type: DataTypes.STRING,
        allowNull:true
    },
    nomorBpjsKetenagakerjaan:{
        type: DataTypes.STRING,
        allowNull:true
    },
    contactEmergencyId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    emergencyNumber:{
        type: DataTypes.STRING,
        allowNull:true
    },
    emergencyAddress:{
        type: DataTypes.STRING,
        allowNull:true
    },
    nomorSim:{
        type: DataTypes.STRING,
        allowNull:true
    },
    golonganDarahId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    bankId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    nomorRekening:{
        type: DataTypes.STRING,
        allowNull:true
    },
    // jamOperasionalId:{
    //     type: DataTypes.INTEGER,
    //     allowNull:true
    // },
    jamOperasionalGroupId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    groupId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    quote:{
        type: DataTypes.STRING,
        allowNull:true
    },
    privilegeId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    statusId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    isAtasan:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
})

Users.hasMany(Users);
Users.belongsTo(Users, {as: 'atasan', foreignKey: 'atasanId'});

Gander.hasMany(Users);
Users.belongsTo(Gander, {foreignKey: 'ganderId'});

Penempatan.hasMany(Users);
Users.belongsTo(Penempatan, {foreignKey: 'penempatanId'});

Jabatan.hasMany(Users);
Users.belongsTo(Jabatan, {foreignKey: 'jabatanId'});

StatusPerkawinan.hasMany(Users);
Users.belongsTo(StatusPerkawinan, {foreignKey: 'statusPerkawinanId'});

Pendidikan.hasMany(Users);
Users.belongsTo(Pendidikan, {foreignKey: 'pendidikanId'});

Status.hasMany(Users);
Users.belongsTo(ContactEmergency, {foreignKey: 'contactEmergencyId'});

GolonganDarah.hasMany(Users);
Users.belongsTo(GolonganDarah, {foreignKey: 'golonganDarahId'});

// JamOperasional.hasMany(Users);
// Users.belongsTo(JamOperasional, {foreignKey: 'jamOperasionalId'});

JamOperasionalGroup.hasMany(Users);
Users.belongsTo(JamOperasionalGroup, {foreignKey: 'jamOperasionalGroupId'});

Group.hasMany(Users);
Users.belongsTo(Group, {foreignKey: 'groupId'});

Bank.hasMany(Users);
Users.belongsTo(Bank, {foreignKey: 'bankId'});

Status.hasMany(Users);
Users.belongsTo(Status, {foreignKey: 'statusId'});

Privilege.hasMany(Users);
Users.belongsTo(Privilege, {foreignKey: 'privilegeId'});

export default Users;