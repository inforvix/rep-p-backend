const router = require('express').Router()
const FuncionarioController = require('../controllers/FuncionarioController')

const verifyToken = require('../helpers/verify-token')

/**
 * @openapi
 * /funcionario/cadastrar:
 *   post:
 *     description: Cadastra um funcionário!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:        
 *               nome:
 *                 type: string
 *               pis:
 *                 type: string
 *               cpf:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               rep_padrao:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Funcionário criado!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!      
 */
router.post('/cadastrar', verifyToken, FuncionarioController.cadastrar)
/**
 * @openapi
 * /funcionario/getall:
 *   get:
 *     description: Busca todas os funcionarios da empresa logada!
 *     responses:
 *       '200':
 *         description: Retorna todas os funcionarios!
 *       '401':
 *         description: Acesso negado!      
 */
router.get('/getall',verifyToken,FuncionarioController.showAllFuncionarios)
/**
 * @openapi
 * /funcionario/cpf:
 *   delete:
 *     description: Apaga um funcionario pelo cpf se ele não tiver marcação!
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: funcionario apagado!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.delete('/delete/:cpf',FuncionarioController.funDel)
/**
 * @openapi
 * /funcionario/cpf/{cpf}:
 *   get:
 *     description: Busca um funcionario pelo pis!
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Retorna o funcinario!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/cpf/:cpf',verifyToken,FuncionarioController.getFunByCPF)
/**
 * @openapi
 * /funcionario/pis/{pis}:
 *   get:
 *     description: Busca um funcionario pelo cpf!
 *     parameters:
 *       - in: path
 *         name: pis
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Retorna o funcinario!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/pis/:pis',verifyToken,FuncionarioController.getFunByPIS)
/**
 * @openapi
 * /funcionario/edit/{cpf}:
 *   patch:
 *     description: Altera um funcionário!
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               pis:
 *                 type: string
 *               cpf:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Funcinário alterado!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.patch('/edit/:cpf', verifyToken, FuncionarioController.editFun)

router.post('/login', FuncionarioController.loginFuncionario)


module.exports = router