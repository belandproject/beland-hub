import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'nft',
    {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      name: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      tokenId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tokenAddress: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      creator: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      owner: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      price: {
        allowNull: false,
        default: '0',
        type: DataTypes.STRING,
      },
      quantity: {
        allowNull: false,
        default: '0',
        type: DataTypes.STRING,
      },
      bidder: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      bidDate: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      auctionStartTime: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      auctionEndTime: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      mimetype: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      imageUrl: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      animationUrl: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      externalUrl: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      thumbnail: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      tokenUri: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      bundles: {
        allowNull: true,
        default: [],
        type: DataTypes.JSONB,
      },
      isBundle: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      votes: {
        allowNull: false,
        type: DataTypes.INTEGER,
        default: 0,
      },
      exchangeAddress: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      quoteToken: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      traits: {
        allowNull: true,
        type: DataTypes.JSONB,
      },
      collectionItemId: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      listedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      soldAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      createdAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      onSale: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      onAuction: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      onLending: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      renter: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      expiredAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      hasOffer: {
        allowNull: false,
        default: false,
        type: DataTypes.BOOLEAN,
      },
      offerCount: {
        allowNull: false,
        default: 0,
        type: DataTypes.INTEGER,
      },
      status: {
        allowNull: false,
        default: 0,
        type: DataTypes.INTEGER,
      },
    },
    {
      indexes: [
        {
          fields: ['creator'],
        },
        {
          fields: ['owner'],
        },
      ],
    }
  );
};
