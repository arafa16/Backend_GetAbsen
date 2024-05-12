import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import TipePendapatan from './TipePendapatan.js';
import Users from './UsersModel.js';

const {DataTypes} = Sequelize;

const Pendapatan = db.define('pendapatan', {
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    tipePendapatanId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    pendapatanAtas:{
        type: DataTypes.STRING,
        allowNull:true
    },
    periode:{
        type: DataTypes.DATE,
        allowNull:true
    }
    ,
    initialPeriode:{
        type: DataTypes.STRING,
        allowNull:true
    },
    basicSalary:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    kjk:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tunjanganJabatan:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    incentive:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    rapel:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    adjustment:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    overtimeAllowance:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tax:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    overtimeFee1:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    overtimeFee2:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tunjanganJht:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tunjanganPensiun:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tunjanganJkk:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tunjanganJkm:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    tunjanganBpjs:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    zakat:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    iuranKoperasi:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    angsuranKoperasi:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    pinalti:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    potonganPinjaman:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    potonganJht:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    potonganBpjs:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    potonganPensiun:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    adjustmentMinus:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    potonganAnggota:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    thr:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    shu:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    bonus:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    kompensasi:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    pph21:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    potonganPph21:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    total:{
        type: DataTypes.DECIMAL,
        allowNull:true
    }
});

TipePendapatan.hasMany(Pendapatan);
Pendapatan.belongsTo(TipePendapatan, {foreignKey: 'tipePendapatanId'});

Users.hasMany(Pendapatan);
Pendapatan.belongsTo(Users, {foreignKey: 'userId'});

export default Pendapatan;