import {Sequelize} from 'sequelize';
import db from '../config/Database.js';

const {DataTypes} = Sequelize;

const Privilege = db.define('privilege', {
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    dashboard:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    editUserSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    absen:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    kalendarSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    pengajuanKoreksiSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    approvalKoreksiSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    approvalAllKoreksiSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    absenModal:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    wfhModal:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    shiftModal:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    absenCheck:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    adminEvent:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    perhitunganAbsen:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    slipGaji:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    pendapatanSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    pendapatanLainSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    pendapatanAdminSub:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    employees:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    dataEmployee:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    attribute:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    setting:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
})

export default Privilege;