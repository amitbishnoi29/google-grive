require('dotenv').config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function testS3Connection() {
    try {
        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);
        console.log('Successfully connected to S3!');
        console.log('Available buckets:', response.Buckets.map(b => b.Name));
        
        // Test bucket access
        const bucketExists = response.Buckets.some(b => b.Name === process.env.AWS_BUCKET_NAME);
        if (bucketExists) {
            console.log(`Bucket "${process.env.AWS_BUCKET_NAME}" exists and is accessible`);
        } else {
            console.log(`Warning: Bucket "${process.env.AWS_BUCKET_NAME}" not found`);
        }
    } catch (error) {
        console.error('Error connecting to S3:', error);
    }
}

testS3Connection(); 