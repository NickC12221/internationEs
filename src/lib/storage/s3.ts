// src/lib/storage/s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT, // For S3-compatible services like MinIO, DigitalOcean Spaces
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: !!process.env.S3_ENDPOINT, // Required for MinIO
})

const PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET || 'femme-public'
const PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET || 'femme-private'
const CDN_URL = process.env.CDN_URL || `https://${PUBLIC_BUCKET}.s3.amazonaws.com`

export type UploadFolder = 'profiles' | 'gallery' | 'verification'

export interface UploadResult {
  key: string
  url: string
}

/**
 * Upload a file buffer to S3
 */
export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  folder: UploadFolder,
  isPrivate = false
): Promise<UploadResult> {
  const ext = mimeType.split('/')[1] || 'jpg'
  const key = `${folder}/${uuidv4()}.${ext}`
  const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: isPrivate ? 'private' : 'public-read',
    })
  )

  const url = isPrivate ? '' : `${CDN_URL}/${key}`
  return { key, url }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string, isPrivate = false): Promise<void> {
  const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}

/**
 * Generate a pre-signed URL for private files (verification documents)
 * URL expires in 1 hour
 */
export async function getPrivateSignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: key,
  })
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

/**
 * Generate a pre-signed upload URL for client-side uploads
 */
export async function getPresignedUploadUrl(
  folder: UploadFolder,
  mimeType: string,
  isPrivate = false
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const ext = mimeType.split('/')[1] || 'jpg'
  const key = `${folder}/${uuidv4()}.${ext}`
  const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
    ACL: isPrivate ? 'private' : 'public-read',
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  const publicUrl = isPrivate ? '' : `${CDN_URL}/${key}`

  return { uploadUrl, key, publicUrl }
}

export function getPublicUrl(key: string): string {
  return `${CDN_URL}/${key}`
}
