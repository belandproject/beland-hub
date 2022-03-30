export default sequelize => {
  const { user, nft, bid, event, estate, parcel, scene, item } = sequelize.models;

  user.hasMany(nft, {
    foreignKey: 'owner',
    constraints: false,
  });
  nft.belongsTo(user, {
    foreignKey: 'creator',
    as: 'creatorInfo',
    constraints: false,
  });

  bid.belongsTo(nft, {
    foreignKey: 'nftId',
    as: 'nft',
  });

  event.belongsTo(nft, {
    foreignKey: 'nftId',
    as: 'nft',
  });

  parcel.belongsTo(scene, {
    foreignKey: 'sceneId',
  });

  parcel.belongsTo(estate, {
    foreignKey: 'estateId',
  });

  estate.hasMany(parcel, {
    foreignKey: 'estateId',
  });

  scene.hasMany(parcel, {
    foreignKey: 'sceneId',
  });

  nft.belongsTo(item, {
    foreignKey: 'itemId',
  })

  item.hasMany(nft, {
    foreignKey: 'itemId',
  });
};
