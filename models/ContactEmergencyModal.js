import {Sequelize} from 'sequelize';
import db from '../config/Database.js';

const {DataTypes} = Sequelize;

const ContactEmergency = db.define('contact_emergency', {
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

export default ContactEmergency;