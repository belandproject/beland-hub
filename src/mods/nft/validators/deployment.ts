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
    const pointersToCheck = [`${x + 1},${y}`, `${x},${y + 1}`, `${x - 1},${y}`, `${x},${y - 1}`];
    for (let p of pointersToCheck) {
      if (!parcelMap[p]) return false;
    }
  }
  return true;
}

export const deploymentValidate = (data: any) => {
  return validateParcels(data.scene.parcels);
};
