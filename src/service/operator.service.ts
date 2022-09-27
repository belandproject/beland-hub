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
