import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import Koreksi from './KoreksiModal.js';

const {DataTypes} = Sequelize;

const HistoryKoreksi = db.define('history_koreksi', {
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    koreksiId:{
        type: DataTypes.INTEGER,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    keterangan:{
        type: DataTypes.TEXT,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    nameCreator:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
});

Koreksi.hasMany(HistoryKoreksi);
HistoryKoreksi.belongsTo(Koreksi, {foreignKey: 'koreksiId'});

export default HistoryKoreksi;