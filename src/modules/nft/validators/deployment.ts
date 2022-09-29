
function isLimit(v: number) {
  return !(v >= -150 && v <= 150);
}

function validateParcels(parcels: string[]) {
  if (parcels.length == 1) return true;
  const parcelMap = {};
  for (let parcel of parcels) {
    if (parcelMap[parcel]) {
      return false;
    }
    parcelMap[parcel] = true;
  }
  for (let parcel of parcels) {
    const [x, y] = parcel.split(',').map(v => Number(v));
    if (isLimit(x) || isLimit(y)) return false;

    const toCheck = [`${x + 1},${y}`, `${x},${y + 1}`, `${x - 1},${y}`, `${x},${y - 1}`];
    if (!toCheck.find(p => !!parcelMap[p])) return false;
  }
  return true;
}

export const validateDeploymentMetadata = (data: any) => {
  if (!validateParcels(data.scene.parcels)) {
    throw Error('Incorrect parcels');
  }
};
