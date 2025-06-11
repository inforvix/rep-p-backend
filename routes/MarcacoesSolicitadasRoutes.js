const router = require('express').Router()
const MarcacaoSolicitadaController = require('../controllers/MarcacaoSolicitadaController')

const verifyToken = require('../helpers/verify-token')

router.post('/solicitar', verifyToken, MarcacaoSolicitadaController.solicitarMarcacao)
router.get('/buscar', verifyToken, MarcacaoSolicitadaController.buscarMarcacoesSolicitadas)

module.exports = router