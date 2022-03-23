import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'hub',
    {
      host: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      is_self: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      is_active: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      scope: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.TEXT,
      },
    },
    {
      indexes: [
        {
          fields: ['address'],
        },
        {
          fields: ['is_self'],
        },
        {
          fields: ['is_active'],
        },
      ],
    }
  );
};
