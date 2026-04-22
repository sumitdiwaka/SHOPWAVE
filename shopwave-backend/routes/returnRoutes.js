import express from 'express';
import {
  createReturn,
  getMyReturns,
  getReturn,
  getAllReturns,
  getVendorReturns,
  approveReturn,
  rejectReturn,
  updateReturnStatus,
  checkReturnEligibility,
} from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/',                    createReturn);
router.get('/my-returns',           getMyReturns);
router.get('/eligibility/:orderId', checkReturnEligibility);

// Vendor route — see returns for their products
router.get('/vendor-returns', authorize('vendor', 'admin'), getVendorReturns);

// Admin routes
router.get('/',             authorize('admin'), getAllReturns);
router.put('/:id/approve',  authorize('admin'), approveReturn);
router.put('/:id/reject',   authorize('admin'), rejectReturn);
router.put('/:id/status',   authorize('admin'), updateReturnStatus);

// Shared — customer/admin/vendor can view single return
router.get('/:id', getReturn);

export default router;