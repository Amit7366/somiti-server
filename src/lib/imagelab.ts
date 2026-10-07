import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export type ImageLabAsset = {
  id: string;
  publicId: string;
  bytes: number;
  format: string;
  url: string;
  transformUrl?: string;
  originalName?: string;
};

type ImageLabResponse = {
  success: boolean;
  message?: string;
  data?: ImageLabAsset;
};

export function isImageLabConfigured(): boolean {
  return Boolean(env.imageLabApiKey);
}

/** Upload via ImageLab Media API — https://imagelab.site/docs */
export async function uploadToImageLab(
  file: Express.Multer.File
): Promise<ImageLabAsset> {
  if (!env.imageLabApiKey) {
    throw new ApiError(503, 'IMAGELAB_API_KEY is not configured');
  }

  const body = new FormData();
  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
  body.append('file', blob, file.originalname || 'upload.jpg');

  const res = await fetch(`${env.imageLabApiUrl}/api/v1/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.imageLabApiKey}` },
    body,
  });

  let json: ImageLabResponse;
  try {
    json = (await res.json()) as ImageLabResponse;
  } catch {
    throw new ApiError(502, 'ImageLab returned an invalid response');
  }

  if (!res.ok || !json.success || !json.data?.url) {
    const status = res.status === 402 ? 402 : res.status >= 400 && res.status < 500 ? res.status : 502;
    throw new ApiError(status, json.message || 'ImageLab upload failed');
  }

  return json.data;
}
