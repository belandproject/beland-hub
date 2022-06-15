import { DataTypes } from 'sequelize';
import { getIpfsFullURL } from '../utils/nft';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'item',
    {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      tokenAddress: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      itemId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      creator: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      imageUrl: {
        allowNull: false,
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue('imageUrl');
          return getIpfsFullURL(rawValue)
        }
      },
      animationUrl: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      maxSupply: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalSupply: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      quoteToken: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      onSale: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      traits: {
        allowNull: false,
        defaultValue: [],
        type: DataTypes.JSONB,
      },
      data: {
        allowNull: false,
        defaultValue: {},
        type: DataTypes.JSONB,
      },
      tokenUri: {
        allowNull: false,
        type: DataTypes.STRING,
      }
    },
    {
      indexes: [],
    }
  );
};
