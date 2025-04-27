const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// const uploadFile = async (file, key) => {
//     const command = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: key,
//         Body: file.buffer,
//         ContentType: file.mimetype
//     });

//     await s3Client.send(command);
//     return key;
// };

const uploadFile = async (file, key, onProgress) => {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        
      },
    });
  
    upload.on('httpUploadProgress', (progress) => {
      if (onProgress) {
        const percent = (progress.loaded / progress.total) * 100;
        console.log('progress', percent.toFixed(2))
        onProgress(percent.toFixed(2));
      }
    });
  
    await upload.done();
    return key;
  };

const getFileUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return url;
};

const deleteFile = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    await s3Client.send(command);
};

// add a download file function
const downloadFile = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return url;
};

module.exports = {
    uploadFile,
    getFileUrl,
    deleteFile,
    downloadFile
}; 