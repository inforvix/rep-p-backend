const router = require('express').Router()
const FunRepController = require('../controllers/FunRepController')

const verifyToken = require('../helpers/verify-token')

/**
 * @openapi
 * /fun_rep/cadastrar:
 *   post:
 *     description: Cadastra um funcionario no Rep-P ou pelo CPF ou pelo PIS!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:        
 *               cpf:
 *                 type: string
 *               pis:
 *                 type: string
 *               repid:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Funcionário cadastrado no Rep-p!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!    
 *       '422':
 *         description: Erro de dados  
 */
router.post('/cadastrar', verifyToken, FunRepController.cadastrar)
/**
 * @openapi
 * /fun_rep/dell:
 *   delete:
 *     description: Apaga um funcinário de um Rep-P pelo PIS ou pelo CPF !
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:        
 *               cpf:
 *                 type: string
 *               pis:
 *                 type: string
 *               repid:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Funcionario apagado do Rep-P!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 *       '422':
 *         description: Erro de dados  
 */
router.delete('/dell',FunRepController.dell)

module.exports = router