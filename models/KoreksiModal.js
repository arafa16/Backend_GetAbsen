import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import Users from './UsersModel.js';
import InOut from './InOutModal.js';
import StatusKoreksi from './StatusKoreksiModal.js';

const {DataTypes} = Sequelize;

const Koreksi = db.define('koreksi', {
    uuid:{
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
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
    inOutId:{
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
    statusKoreksiId:{
        type: DataTypes.INTEGER,
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

Users.hasMany(Koreksi);
Koreksi.belongsTo(Users, {foreignKey: 'userId'});

InOut.hasMany(Koreksi);
Koreksi.belongsTo(InOut, {foreignKey: 'inOutId'});

StatusKoreksi.hasMany(Koreksi);
Koreksi.belongsTo(StatusKoreksi, {foreignKey: 'statusKoreksiId'});


export default Koreksi;