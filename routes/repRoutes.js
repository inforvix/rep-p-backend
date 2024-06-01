const router = require('express').Router()
const RepController = require('../controllers/RepController')

const verifyToken = require('../helpers/verify-token')



/**
 * @openapi
 * /rep/cadastrar/{idempresa}:
 *   post:
 *     description: Cadastra um Rep-P!
 *     parameters:
 *       - in: path
 *         name: idempresa
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Rep-P criado!
 *       '422': 
 *         description: Erro de validação de campos!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!      
 */
router.post('/cadastrar/:idempresa', verifyToken, RepController.cadastrar)
/**
 * @openapi
 * /rep/getall:
 *   get:
 *     description: Busca todas os Rep's da empresa logada!
 *     responses:
 *       '200':
 *         description: Retorna todas os Rep's!
 *       '401':
 *         description: Acesso negado!     
 *       '500':
 *         description: Erro na tranasção com banco! 
 */
router.get('/getall',verifyToken,RepController.showAll)
/**
 * @openapi
 * /rep/id/{id}:
 *   delete:
 *     description: Apaga um Rep-P pelo id se ele não tiver marcação!
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Rep-P apagado!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.delete('/:id',RepController.dell)
/**
 * @openapi
 * /rep/{id}:
 *   get:
 *     description: Busca um Rep-P pelo id!
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Retorna o Rep-P!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/:id',verifyToken,RepController.getById)
/**
 * @openapi
 * /rep/buscacnpj/{cnpj}:
 *   get:
 *     description: Busca os Rep's pelo cnpj!
 *     parameters:
 *       - in: path
 *         name: cnpj
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Retorna os Rep's!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/buscacnpj/:cnpj',verifyToken,RepController.getRepByCNPJ)
/**
 * @openapi
 * /rep/edit:
 *   patch:
 *     description: Altera um Rep-p!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               cnpj:
 *                 type: string
 *               cpf:
 *                 type: string
 *               nome_rep:
 *                 type: string
 *               razao:
 *                 type: string
 *               local:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *               empresaid:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Rep alterado!
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.patch('/edit', verifyToken, RepController.editRep)

router.get('/datahora/agora', RepController.getHora) 
/**
 * @openapi
 * /rep/afd/{id}:
 *   get:
 *     description: Busca um AFD de um Rep-P!
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: DOWNLOAD AFD !
 *       '500':
 *         description: Erro na tranasção com banco!
 *       '401':
 *         description: Acesso negado!  
 */
router.get('/afd/:id', RepController.afd)

module.exports = router