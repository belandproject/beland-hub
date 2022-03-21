import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'collection',
    {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },

      creator: {
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

      symbol: {
        allowNull: false,
        type: DataTypes.STRING,
      },

      isEditable: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      isApproved: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      isPublished: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      indexes: [],
    }
  );
};
