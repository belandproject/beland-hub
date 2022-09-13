import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    avatar_image: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    banner_image: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    introduction: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    version: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    tutorialStep: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    tutorialFlagsMask: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    hasClaimedName: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    website: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    avatar: {
      allowNull: true,
      type: DataTypes.JSONB,
    },
    muted: {
      allowNull: false,
      defaultValue: [],
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    blocked: {
      allowNull: false,
      defaultValue: [],
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
  });
};
