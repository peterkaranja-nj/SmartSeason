const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAgents, createAgent, deleteAgent } = require('../controllers/usersController');

router.get('/', authenticate, requireAdmin, getAgents);
router.post('/', authenticate, requireAdmin, createAgent);
router.delete('/:id', authenticate, requireAdmin, deleteAgent);

module.exports = router;
