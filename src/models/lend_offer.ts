import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'lend_offer',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      txhash: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      nftId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      renter: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      address: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      duration: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      quoteToken: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [
        {
          fields: ['renter'],
        },
        {
          fields: ['nftId'],
        },
        {
          fields: ['address'],
        },
      ],
    }
  );
};
