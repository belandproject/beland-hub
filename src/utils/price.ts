import { ethers } from 'ethers';

const MAX_PRICE = ethers.utils.parseEther('50000000000');

export function getPrice(price: ethers.BigNumber): ethers.BigNumber {
  if (price.gt(MAX_PRICE)) {
    return MAX_PRICE;
  }
  return price;
}
