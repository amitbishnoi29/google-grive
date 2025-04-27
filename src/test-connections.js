require('dotenv').config();

// Debug environment variables
console.log('\nEnvironment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('AWS_REGION:', process.env.AWS_REGION ? '✅ Set' : '❌ Not set');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME ? '✅ Set' : '❌ Not set');

// Verify required environment variables
if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is required but not set');
    process.exit(1);
}

const mongoose = require('mongoose');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

// Test MongoDB Connection
async function testMongoConnection() {
    try {
        console.log('\nTesting MongoDB Connection...');
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB!');
        
        // Test basic database operations
        const testCollection = mongoose.connection.db.collection('test_connection');
        await testCollection.insertOne({ timestamp: new Date() });
        const result = await testCollection.findOne({});
        console.log('✅ Successfully performed database operations');
        
        // Clean up
        await testCollection.deleteMany({});
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
}

// Test S3 Connection
async function testS3Connection() {
    try {
        console.log('\nTesting S3 Connection...');
        const s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);
        console.log('✅ Successfully connected to S3!');
        console.log('Available buckets:', response.Buckets.map(b => b.Name));
        
        // Test bucket access
        const bucketExists = response.Buckets.some(b => b.Name === process.env.AWS_BUCKET_NAME);
        if (bucketExists) {
            console.log(`✅ Bucket "${process.env.AWS_BUCKET_NAME}" exists and is accessible`);
        } else {
            console.log(`⚠️ Warning: Bucket "${process.env.AWS_BUCKET_NAME}" not found`);
        }
    } catch (error) {
        console.error('❌ S3 Connection Error:', error.message);
        process.exit(1);
    }
}

// Run all tests
async function runTests() {
    console.log('Starting connection tests...\n');
    
    await testMongoConnection();
    await testS3Connection();
    
    console.log('\nTests completed!');
    process.exit(0);
}

runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
}); 