const express = require('express');
const router = express.Router();
const controller = require('../controllers/safeDailiesController');

router.post('/add', controller.add);
router.get('/all', controller.getAll);
router.post('/get', controller.getOne);
router.post('/update', controller.update);
router.post('/delete', controller.delete);

module.exports = router;
