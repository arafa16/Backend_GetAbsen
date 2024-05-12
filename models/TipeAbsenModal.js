import {Sequelize} from 'sequelize';
import db from '../config/Database.js';

const {DataTypes} = Sequelize;

const TipeAbsen = db.define('tipe_absen', {
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
        type: DataTypes.DECIMAL,
        allowNull:true
    },
    isSelect:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }
});

export default TipeAbsen;