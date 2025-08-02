const DetailedAccountModel = require("../../models/DetailedAccount")

const updateTransaction = async ({
    transactionId,
    accountId,
    updateData,
    repository
}) => {
  if (!transactionId || !accountId || !updateData) {
    throw new Error('Dados da transação incompletos');
  }
  
  const result = await repository.updateById(transactionId, updateData);
  return new DetailedAccountModel(result.toJSON());
}

module.exports = updateTransaction;
