import {Sequelize} from 'sequelize';
import db from '../config/Database.js';

const {DataTypes} = Sequelize;

const StatusPerkawinan = db.define('status_perkawinan', {
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
    code:{
        type: DataTypes.STRING,
        allowNull:true
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
});

export default StatusPerkawinan;