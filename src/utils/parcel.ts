function getParcelIdFromPointer(pointer: string): number {
  const pointerArr = pointer.split(',');
  if (pointerArr.length < 2) return undefined;
  let x = (Number(pointerArr[0]) + 150) % 300;
  let y = (Number(pointerArr[1]) + 150) * 300;

  return x + y;
}

export function getParcelIdsFromPointers(pointers) {
  return pointers.map(getParcelIdFromPointer).filter(parcelId => typeof parcelId != 'undefined');
}
