import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'scene',
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
      description: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tokenURI: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      contents: {
        allowNull: false,
        type: DataTypes.JSONB,
      },
      isDeployed: {
        allowNull: false,
        type: DataTypes.JSONB,
      },
      metadata: {
        allowNull: false,
        type: DataTypes.JSONB,
      },
    },
    {
      indexes: [],
    }
  );
};
