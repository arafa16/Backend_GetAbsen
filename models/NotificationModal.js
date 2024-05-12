import {Sequelize} from 'sequelize';
import db from '../config/Database.js';
import Status from './StatusModel.js';
import Users from './UsersModel.js';
import TipeNotification from './TipeNotificationModal.js';

const {DataTypes} = Sequelize;

const Notification = db.define('notification', {
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
    keterangan:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty: true
        }
    },
    tipeNotificationId:{
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

TipeNotification.hasMany(Notification);
Notification.belongsTo(TipeNotification, {foreignKey: 'tipeNotificationId'});

Users.hasMany(Notification);
Notification.belongsTo(Users, {foreignKey: 'userId'});

export default Notification;