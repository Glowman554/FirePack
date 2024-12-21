import { config } from './config.ts';

export interface UploadResult {
    uploadToken: string;
    id: string;
    url: string;
}

export async function prepareUpload(fileName: string) {
    const res = await fetch(config.upload.uploadServer + '/api/v1/prepare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authentication: config.upload.authToken,
        },
        body: JSON.stringify({ name: fileName }),
    });
    if (!res.ok) {
        throw new Error('Failed to prepare upload');
    }

    const json = (await res.json()) as UploadResult;
    return json;
}

export async function deleteFile(fileId: string) {
    const res = await fetch(config.upload.uploadServer + '/api/v1/delete/' + fileId, {
        headers: {
            Authentication: config.upload.authToken,
        },
    });
    if (!res.ok) {
        throw new Error('Failed to delete file');
    }
}

export function idFromUrl(url: string) {
    return url.split('/').pop()!;
}
