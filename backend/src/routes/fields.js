const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getFields, getField, createField, updateField, deleteField, addUpdate
} = require('../controllers/fieldsController');

router.get('/', authenticate, getFields);
router.get('/:id', authenticate, getField);
router.post('/', authenticate, requireAdmin, createField);
router.put('/:id', authenticate, requireAdmin, updateField);
router.delete('/:id', authenticate, requireAdmin, deleteField);
router.post('/:id/updates', authenticate, addUpdate);

module.exports = router;
