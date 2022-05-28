import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'bid',
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
      bidder: {
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
      quoteToken: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [
        {
          fields: ['bidder'],
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
