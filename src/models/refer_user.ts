import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'refer_user',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      referrer: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      user: {
        allowNull: true,
        unique: true,
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['user'],
        },
        {
          fields: ['referrer'],
        },
        {
          fields: ['code'],
        },
      ],
    }
  );
};
