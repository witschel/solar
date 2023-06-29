import express from 'express';
import controller from '../controller/stats';
const router = express.Router();

router.get('/stats', controller.getStats);

export = router;