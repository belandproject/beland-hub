import database from '../database';
const { operator: Operator } = database.models;

export type UpdateOperatorData = {
  contract: string;
  owner: string;
  operator: string;
  approved: boolean;
};

export async function updateOperator(operatorData: UpdateOperatorData) {
  const { approved, ...otherData } = operatorData;
  const operator = await Operator.findOne({
    where: otherData,
  });

  if (!approved && operator) {
    await operator.delete();
  }
  if (!operator) {
    await Operator.create(operatorData);
  }
}

export async function isOperatorUpdates(owner: string, operator: string, contract: string) {
  if (owner == operator) return true;
  const operatorCount = await Operator.count({
    where: {
      owner,
      operator,
      contract,
    },
  });
  return operatorCount > 0;
}

export async function isOperator(
  objects: any[],
  owner: string,
  operator: string,
  contractName: string
) {
  let _isOperator: boolean;
  const _isOperatorUpdates = await isOperatorUpdates(owner, operator, contractName);
  const now = Date.now();
  for (var obj of objects) {
    _isOperator =
      owner == obj.owner &&
      (obj.operator == operator ||
        _isOperatorUpdates ||
        obj.owner == operator ||
        isRenter(obj, operator, now));
    if (!_isOperator) return false;
  }
  return true;
}

function isRenter(obj, operator: string, now: number) {
  return obj.renter === operator && obj.expiredAt != null && obj.expiredAt.getTime() >= now;
}
