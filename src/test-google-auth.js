require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

async function testGoogleCredentials() {
    try {
        console.log('\nTesting Google OAuth Credentials...');
        
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new Error('Google credentials not found in .env file');
        }

        console.log('✅ Google Client ID and Secret found in .env');

        // Create OAuth2 client
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:3000/api/auth/google/callback'
        );

        // Generate authorization URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            prompt: 'consent'
        });

        console.log('✅ Successfully generated authorization URL');
        console.log('\nTo complete the test:');
        console.log('1. Visit this URL in your browser:');
        console.log(authUrl);
        console.log('\n2. After authorization, you\'ll be redirected to localhost');
        console.log('3. Check the URL for the authorization code');
        console.log('\nNote: This is just a test to verify credentials. The actual callback won\'t work without a running server.');

    } catch (error) {
        console.error('❌ Google OAuth Test Error:', error.message);
        if (error.message.includes('invalid_client')) {
            console.error('This usually means your Client ID or Secret is incorrect');
        }
    }
}

testGoogleCredentials().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
}); 