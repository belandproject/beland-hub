import database from '../database';
import { isEstateContract, isParcelContract } from '../modules/nft/mappings/utils';
const { parcel: Parcel, estate: Estate } = database.models;

export async function updateRenterForRelatedModels(nft) {
  if (isParcelContract(nft.tokenAddress)) {
    const parcel = await Parcel.findByPk(Number(nft.tokenId));
    parcel.renter = nft.renter;
    parcel.expiredAt = nft.expiredAt;
    await parcel.save();
  } else if (isEstateContract(nft.tokenAddress)) {
    const estate = await Estate.findByPk(Number(nft.tokenId));
    estate.renter = nft.renter;
    estate.expiredAt = nft.expiredAt;
    await estate.save();
  }
}
