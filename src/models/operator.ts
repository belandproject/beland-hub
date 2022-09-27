import { DataTypes } from 'sequelize';

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = sequelize => {
  sequelize.define(
    'operator',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      contract: {
        allowNull: false,
        type: DataTypes.STRING,
      },

      owner: {
        allowNull: false,
        type: DataTypes.STRING,
      },

      operator: {
        allowNull: true,
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [
        {
          fields: ['owner', 'operator', 'contract'],
          unique: true,
        },

        {
          fields: ['owner'],
        },
        {
          fields: ['operator'],
        },
        {
          fields: ['contract'],
        },
      ],
    }
  );
};
