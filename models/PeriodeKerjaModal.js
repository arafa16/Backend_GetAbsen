import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import Status from './StatusModel.js';

const {DataTypes} = Sequelize;

const PeriodeKerja = db.define('periode_kerja', {
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    name:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    bulan:{
        type: DataTypes.DECIMAL,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    tahun:{
        type: DataTypes.DECIMAL,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    tanggalMulai:{
        type: DataTypes.DATE,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    tanggalSelesai:{
        type: DataTypes.DATE,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    jumlahHari:{
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    code:{
        type: DataTypes.STRING,
        allowNull:true
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
});

export default PeriodeKerja;