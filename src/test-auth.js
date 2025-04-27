require('dotenv').config();
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User');

async function testGoogleAuth() {
    try {
        console.log('\nTesting Google Authentication Flow...\n');

        // 1. Test MongoDB Connection
        console.log('1. Testing MongoDB Connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully\n');

        // 2. Test Google OAuth Configuration
        console.log('2. Testing Google OAuth Configuration...');
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new Error('Google credentials not found in .env file');
        }
        console.log('✅ Google Credentials Found\n');

        // 3. Test OAuth2 Client
        console.log('3. Testing OAuth2 Client...');
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

        console.log('✅ OAuth2 Client Configured Successfully');
        console.log('\nTo complete the test:');
        console.log('1. Visit this URL in your browser:');
        console.log(authUrl);
        console.log('\n2. After authorization, you\'ll be redirected to localhost');
        console.log('3. Copy the authorization code from the URL');
        console.log('4. Enter the code below when prompted\n');

        // Wait for user input
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('Enter the authorization code: ', async (code) => {
            try {
                // 4. Exchange code for tokens
                console.log('\n4. Exchanging code for tokens...');
                const { tokens } = await oauth2Client.getToken(code);
                console.log('✅ Successfully obtained tokens\n');

                // 5. Verify ID token
                console.log('5. Verifying ID token...');
                const ticket = await oauth2Client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                const payload = ticket.getPayload();
                console.log('✅ ID token verified successfully\n');

                // 6. Test User Creation/Update
                console.log('6. Testing User Creation/Update...');
                let user = await User.findOne({ googleId: payload.sub });

                if (!user) {
                    user = await User.create({
                        googleId: payload.sub,
                        email: payload.email,
                        name: payload.given_name,
                        displayName: payload.name,
                        profilePicture: payload.picture,
                        googleTokens: {
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                            token_type: tokens.token_type,
                            expiry_date: tokens.expiry_date
                        }
                    });
                    console.log('✅ New user created successfully');
                } else {
                    user.googleTokens = {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token || user.googleTokens.refresh_token,
                        token_type: tokens.token_type,
                        expiry_date: tokens.expiry_date
                    };
                    await user.save();
                    console.log('✅ Existing user updated successfully');
                }

                console.log('\nUser Details:');
                console.log('ID:', user._id);
                console.log('Email:', user.email);
                console.log('Name:', user.name);
                console.log('Google ID:', user.googleId);
                console.log('Tokens stored:', !!user.googleTokens);

                // 7. Test Token Refresh
                console.log('\n7. Testing Token Refresh...');
                oauth2Client.setCredentials({
                    refresh_token: user.googleTokens.refresh_token
                });
                const { credentials } = await oauth2Client.refreshAccessToken();
                console.log('✅ Token refresh successful');
                console.log('New access token obtained');

                // Clean up
                await mongoose.connection.close();
                readline.close();
                console.log('\n✅ All tests completed successfully!');

            } catch (error) {
                console.error('❌ Test failed:', error.message);
                readline.close();
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testGoogleAuth(); 