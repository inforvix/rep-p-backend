const router = require('express').Router()
const OperadorController = require('../controllers/OperadorController')

const verifyToken = require('../helpers/verify-token')

/**
 * @openapi
 * /operador/cadastrar:
 *   post:
 *     description: Cadastra um Operador!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:        
 *               cpf:
 *                 type: string
 *               nome:
 *                 type: string
 *               ativo:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Operador criado!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!      
 */
router.post('/cadastrar', verifyToken, OperadorController.cadastrar)
router.post('/buscar-cpf/:cpf', verifyToken, OperadorController.getOperadorByCPF)


module.exports = router