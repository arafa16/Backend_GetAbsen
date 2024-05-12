import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import TipeEvent from './TipeEventModal.js';

const {DataTypes} = Sequelize;

const Event = db.define('event', {
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
    tipeEventId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    code:{
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
});

export default Event;

TipeEvent.hasMany(Event);
Event.belongsTo(TipeEvent, {foreignKey: 'tipeEventId'});
