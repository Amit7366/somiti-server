import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { PERMISSIONS } from '../../constants/permissions';
import { isImageLabConfigured, uploadToImageLab } from '../../lib/imagelab';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission, somitiScoped } from '../../middlewares/authorize.middleware';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/ApiResponse';
import { env } from '../../config/env';

const uploadRoot = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new ApiError(400, 'Only image files are allowed') as unknown as Error);
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.use(authenticate, somitiScoped);

router.post(
  '/',
  requirePermission(PERMISSIONS.MEMBER_WRITE, PERMISSIONS.USER_WRITE),
  upload.single('file'),
  catchAsync(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file uploaded');

    // Prefer ImageLab (secret key stays on the server — never in the client).
    if (isImageLabConfigured()) {
      const asset = await uploadToImageLab(req.file);
      sendResponse(res, 201, 'File uploaded', {
        url: asset.url,
        transformUrl: asset.transformUrl,
        publicId: asset.publicId,
        id: asset.id,
        filename: asset.publicId,
        originalName: req.file.originalname,
        size: asset.bytes,
        mimeType: req.file.mimetype,
        provider: 'imagelab' as const,
      });
      return;
    }

    // Dev-only fallback until IMAGELAB_API_KEY is set.
    if (env.isProd) {
      throw new ApiError(503, 'IMAGELAB_API_KEY is not configured');
    }

    const safe = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safe}`;
    fs.writeFileSync(path.join(uploadRoot, filename), req.file.buffer);
    const url = `/uploads/${filename}`;

    sendResponse(res, 201, 'File uploaded (local fallback — set IMAGELAB_API_KEY)', {
      url,
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      provider: 'local' as const,
    });
  })
);

export const uploadRoutes = router;
export { uploadRoot };
