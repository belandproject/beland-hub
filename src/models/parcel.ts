import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'parcel',
    {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      owner: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      image: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      x: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      y: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      estateId: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      sceneId: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      operator: {
        allowNull: true,
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [],
    }
  );
};
