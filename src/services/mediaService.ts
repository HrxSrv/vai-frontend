import api from './api';

export const getPresignedUrl = async (
  sessionId: string,
  fileType = 'video/webm',
  fileSize?: number
) => {
  const response = await api.post('/media/presigned-url', {
    sessionId,
    fileType,
    fileSize,
    clientTimestamp: new Date().toISOString(),
  });
  return response.data;
};

export const confirmUpload = async (
  sessionId: string,
  fileUrl: string,
  fileSize: number,
  fileName: string
) => {
  const response = await api.post('/media/upload-complete', {
    sessionId,
    fileUrl,
    fileSize,
    fileName,
    clientTimestamp: new Date().toISOString(),
  });
  return response.data;
};

export const getSignedUrl = async (sessionId: string) => {
  const response = await api.get(`/media/signed-url/${sessionId}`);
  return response.data.signedUrl;
};

export const deleteRecording = async (sessionId: string) => {
  const response = await api.delete(`/media/${sessionId}/recording`);
  return response.data;
};

export const getMediaStatus = async (sessionId: string) => {
  const response = await api.get(`/media/status/${sessionId}`);
  return response.data.status;
};

// Function to upload to S3 using presigned URL - FIXED
export const uploadToS3 = async (presignedPost: any, file: File) => {
  const formData = new FormData();
  
  // Append all fields from presignedPost.fields to formData FIRST
  Object.entries(presignedPost.fields).forEach(([key, value]) => {
    formData.append(key, value as string);
  });
  
  // Append the file last
  formData.append('file', file);
  
  // Upload to S3
  const response = await fetch(presignedPost.url, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('S3 Upload Error:', response.status, errorText);
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
};
