const router = require('express').Router()
const EmpresaController = require('../controllers/EmpresaController')

const verifyToken = require('../helpers/verify-token')

/**
 * @openapi
 * /empresa/cadastrar:
 *   post:
 *     description: Cadastra uma empersa!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cnpj:
 *                 type: string
 *               contrato:
 *                 type: string
 *               fantasia:
 *                 type: string
 *               razao:
 *                 type: string
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Empresa criada!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!      
 */
router.post('/cadastrar',verifyToken,EmpresaController.cadastrar)
/**
 * @openapi
 * /empresa/getall:
 *   get:
 *     description: Busca todas as empersas!
 *     responses:
 *       '200':
 *         description: Retorna todas as empresas!
 *       '401':
 *         description: Acesso negado!      
 */
router.get('/getall',verifyToken,EmpresaController.showAllEmpresa)
/**
 * @openapi
 * /empresa/login:
 *   post:
 *     description: Login no RepP!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Retorna Json Web Token para continuar a comunicação!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!     
 */
router.post('/login',EmpresaController.login)

router.get('/chechuser',EmpresaController.chechUserEmp)
/**
 * @openapi
 * /empresa/{id}:
 *   get:
 *     description: Busca uma empresa pelo id!
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Retorna a empresa!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/:id',verifyToken,EmpresaController.getEmpById)
/**
 * @openapi
 * /empresa/edit/{id}:
 *   patch:
 *     description: Altera uma empersa!
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cnpj:
 *                 type: string
 *               contrato:
 *                 type: string
 *               fantasia:
 *                 type: string
 *               razao:
 *                 type: string
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *               email:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Empresa alterada!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.patch('/edit/:id', verifyToken, EmpresaController.editEmp)
/**
 * @openapi
 * /empresa/cnpj/{cnpj}:
 *   get:
 *     description: Busca uma empresa pelo cnpj!
 *     parameters:
 *       - in: path
 *         name: cnpj
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Retorna a empresa!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/cnpj/:cnpj',verifyToken,EmpresaController.getEmpByCNPJ)

module.exports = router