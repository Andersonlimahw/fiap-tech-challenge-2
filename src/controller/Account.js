const TransactionDTO = require('../models/DetailedAccount')


class AccountController {
  constructor(di = {}) {
    this.di = Object.assign({
      userRepository: require('../infra/mongoose/repository/userRepository'),
      accountRepository: require('../infra/mongoose/repository/accountRepository'),
      cardRepository: require('../infra/mongoose/repository/cardRepository'),
      transactionRepository: require('../infra/mongoose/repository/detailedAccountRepository'),

      saveCard: require('../feature/Card/saveCard'),
      salvarUsuario: require('../feature/User/salvarUsuario'),
      saveAccount: require('../feature/Account/saveAccount'),
      getUser: require('../feature/User/getUser'),
      getAccount: require('../feature/Account/getAccount'),
      saveTransaction: require('../feature/Transaction/saveTransaction'),
      getTransaction: require('../feature/Transaction/getTransaction'),
      deleteTransaction: require('../feature/Transaction/deleteTransaction'),
      updateTransaction: require('../feature/Transaction/updateTransaction'),
      getCard: require('../feature/Card/getCard'),
    }, di)
  }

  async find(req, res) {
    const { accountRepository, getAccount, getCard, getTransaction, transactionRepository, cardRepository } = this.di

    try {
      const userId =   req.user.id
      const account = await getAccount({ repository: accountRepository,  filter: { userId } })
      const transactions = await getTransaction({ filter: { accountId: account[0].id }, repository: transactionRepository })
      const cards = await getCard({ filter: { accountId: account[0].id }, repository: cardRepository })
    
      res.status(200).json({
        message: 'Conta encontrada carregado com sucesso',
        result: {
          account,
          transactions,
          cards,
        }
      })
    } catch (error) {
      res.status(500).json({
        message: 'Erro no servidor'
      })
    }
    
  }

  async createTransaction(req, res) {
    const { saveTransaction, transactionRepository } = this.di
    const { accountId, value, type, from, to, anexo } = req.body
    const transactionDTO = new TransactionDTO({ accountId, value, from, to, anexo, type, date: new Date() })

    const transaction = await saveTransaction({ transaction: transactionDTO, repository: transactionRepository })
    
    res.status(201).json({
      message: 'Transação criada com sucesso',
      result: transaction
    })
  }

  async getStatment(req, res) {
    const { getTransaction, transactionRepository } = this.di

    const { accountId } = req.params

    const transactions = await getTransaction({ filter: { accountId } ,  repository: transactionRepository})
    res.status(201).json({
      message: 'Transação criada com sucesso',
      result: {
        transactions
      }
    })
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const { accountRepository, deleteAccount } = this.di;

      if (!id) {
        return res.status(400).json({ 
            message: 'ID da conta não fornecido' 
        });
      }

      const deletedAccount = await deleteAccount({
          id,
          repository: accountRepository
      });

      if (!deletedAccount) {
        return res.status(404).json({ 
            message: 'Conta não encontrada' 
        });
      }

      res.status(200).json({
          message: 'Conta deletada com sucesso',
          result: deletedAccount
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
          message: 'Erro ao deletar conta',
          error: error.message
      });
    }
  }

  async deleteTransactionById(req, res) {
    try {
      const { transactionId, accountId } = req.params;
      const { transactionRepository, deleteTransaction } = this.di;

      if (!transactionId || !accountId) {
        return res.status(400).json({ 
            message: 'ID da transação ou conta não fornecido' 
        });
      }

      const deletedTransaction = await deleteTransaction({
          transactionId,
          accountId,
          repository: transactionRepository
      });

      if (!deletedTransaction) {
        return res.status(404).json({ 
            message: `Transação com ID ${transactionId} não encontrada para a conta ${accountId}`
        });
      }

      res.status(200).json({
          message: `Transação com ID ${transactionId} deletada com sucesso para a conta ${accountId}`,
          result: deletedTransaction
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
          message: 'Erro ao deletar transação',
          error: error.message
      });
    }
  }

  async updateTransactionById(req, res) {
    try {
      const { transactionId, accountId } = req.params;
      const updateData = req.body;
      const { transactionRepository, updateTransaction } = this.di;

      if (!transactionId || !accountId) {
        return res.status(400).json({ 
          message: 'ID da transação ou conta não fornecido' 
        });
      }

      const updatedTransaction = await updateTransaction({
        transactionId,
        accountId,
        updateData,
        repository: transactionRepository
      });

      if (!updatedTransaction) {
        return res.status(404).json({ 
          message: `Transação com ID ${transactionId} não encontrada para a conta ${accountId}`
        });
      }

      res.status(200).json({
        message: 'Transação atualizada com sucesso',
        result: updatedTransaction
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        message: 'Erro ao atualizar transação',
        error: error.message
      });
    }
  }
}


module.exports = AccountController;

