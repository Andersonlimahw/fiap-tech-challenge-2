const userDTO = require('../models/User')
const accountDTO = require('../models/Account')
const cardDTO = require('../models/Card')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'tech-challenge'

class UserController {
  constructor(di = {}) {
    this.di = Object.assign({
      userRepository: require('../infra/mongoose/repository/userRepository'),
      accountRepository: require('../infra/mongoose/repository/accountRepository'),
      cardRepository: require('../infra/mongoose/repository/cardRepository'),

      saveCard: require('../feature/Card/saveCard'),
      salvarUsuario: require('../feature/User/salvarUsuario'),
      updateUser: require('../feature/User/updateUser'),
      saveAccount: require('../feature/Account/saveAccount'),
      getUser: require('../feature/User/getUser'),
    }, di)
  }

  async create(req, res) {
    const user = new userDTO(req.body)
    const { userRepository, accountRepository, cardRepository, salvarUsuario, saveAccount, saveCard } = this.di

    if (!user.isValid()) return res.status(400).json({ 'message': 'não houve informações enviadas' })
    try {
      const userCreated = await salvarUsuario({
        user, repository: userRepository
      })

      const accountCreated = await saveAccount({ account: new accountDTO({ userId: userCreated.id, type: 'Debit' }), repository: accountRepository })

      const firstCard = new cardDTO({
        type: 'GOLD',
        number: 13748712374891010,
        dueDate: '2027-01-07',
        functions: 'Debit',
        cvc: '505',
        paymentDate: null,
        name: userCreated.username,
        accountId: accountCreated.id,
        type: 'Debit'
      })

      const cardCreated = await saveCard({ card: firstCard, repository: cardRepository })

      res.status(201).json({
        message: 'usuário criado com sucesso',
        result: userCreated,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'caiu a aplicação' })
    }

  }
  async update(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ message: 'ID não fornecido' });
      }

      // Remove id and _id from update data to avoid conflicts
      const { id: bodyId, _id, ...updateData } = req.body;

      const user = new userDTO({
        ...updateData,
        updatedAt: new Date()
      });

      const { userRepository, updateUser } = this.di;

      if (!user.isValid()) {
        return res.status(400).json({ message: 'dados inválidos' });
      }

      const userUpdated = await userRepository.update(id, updateData);

      if (!userUpdated) {
        return res.status(404).json({ message: 'usuário não encontrado' });
      }

      res.status(200).json({
        message: 'usuário atualizado com sucesso',
        result: userUpdated,
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }
  }
  async find(req, res) {

    const { userRepository, getUser } = this.di
    try {
      const users = await getUser({ repository: userRepository })
      res.status(200).json({
        message: 'Usuário carregado com sucesso',
        result: users
      })
    } catch (error) {
      res.status(500).json({
        message: 'Erro no servidor'
      })
    }

  }
  async auth(req, res) {
    const { userRepository, getUser } = this.di
    const { email, password } = req.body
    const user = await getUser({ repository: userRepository, userFilter: { email, password } })

    console.log('[Controller][User]: Auth -> ', {
      user,
      email,
    });

    if (!user?.[0]) return res.status(401).json({ message: 'Usuário não encontrado' })
    const userToTokenize = { ...user[0], id: user[0].id.toString() }
    res.status(200).json({
      message: 'Usuário autenticado com sucesso',
      result: {
        token: jwt.sign(userToTokenize, JWT_SECRET, { expiresIn: '12h' })
      }
    })
  }
  static getToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return decoded
    } catch (error) {
      return null
    }
  }
}



module.exports = UserController