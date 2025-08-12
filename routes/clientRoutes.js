import express from 'express';
// import { protect } from '../middleware/authMiddleware';


import * as clientController from '../controller/clientController'
import { register, login } from '../controller/clientController';
const router = express.Router();

router.get('/clients', clientController.getClients);
router.post('/api/Authentication/ClientSignUp', register);
router.post('/api/Authentication/ClientSignIn', login);
router.put('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);
router.get('/clients/search', clientController.searchClients); 


export default router;