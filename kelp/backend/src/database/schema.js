import { DataTypes } from "sequelize";
import connection from "../connection.js";

const sequelize = await connection();


const User = sequelize.define("User", {
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,   
    }
    }, {tableName: "user"});

const userChatHistory = sequelize.define("userChatHistory", {
    chatHistoryId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId : {
        type: DataTypes.INTEGER,
        allowNull: false,
    }, 
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {tableName: "userChatHistory"});


const userChatHistoryMessages = sequelize.define("userChatHistoryMessages", {
    userChatHistoryMessagesId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatHistoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    messages: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {tableName: "userChatHistoryMessages"});

userChatHistory.hasMany(userChatHistoryMessages, {foreignKey: 'chatHistoryId'});
  
userChatHistoryMessages.belongsTo(userChatHistory, {foreignKey: 'chatHistoryId' });
  

const syncSchema = async () => {
    await sequelize.sync();
};

await syncSchema();

export {User, userChatHistory, userChatHistoryMessages};
