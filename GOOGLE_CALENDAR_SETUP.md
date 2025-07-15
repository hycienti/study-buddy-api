# Google Calendar API Setup Guide

This guide will help you set up Google Calendar API integration for your Study Buddy application.

## Option 1: Service Account (Recommended for Server-to-Server)

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down the Project ID

### 2. Enable Google Calendar API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 3. Create a Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `study-buddy-calendar`
   - Description: `Service account for Study Buddy calendar integration`
4. Click "Create and Continue"
5. Skip role assignment (or assign minimal Calendar roles if needed)
6. Click "Done"

### 4. Generate Service Account Key
1. Click on the created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the JSON file
6. **Keep this file secure and never commit it to version control**

### 5. Extract Credentials from JSON
The downloaded JSON file contains all the credentials you need. Extract the following values for your `.env` file:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 6. Configure Environment Variables
Copy the values from the JSON file to your `.env` file:

```env
GOOGLE_CALENDAR_TYPE="service_account"
GOOGLE_CALENDAR_PROJECT_ID="your-project-id"
GOOGLE_CALENDAR_PRIVATE_KEY_ID="your-private-key-id"
GOOGLE_CALENDAR_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_CALENDAR_CLIENT_ID="123456789"
GOOGLE_CALENDAR_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
GOOGLE_CALENDAR_TOKEN_URI="https://oauth2.googleapis.com/token"
GOOGLE_CALENDAR_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
GOOGLE_CALENDAR_CLIENT_X509_CERT_URL="your-cert-url"
GOOGLE_CALENDAR_CALENDAR_ID="primary"
```

**Important:** When copying the private key, make sure to preserve the `\n` characters for line breaks.

### 7. Share Calendar with Service Account (Optional)
If you want the service account to access a specific calendar:
1. Open Google Calendar
2. Go to calendar settings
3. Add the service account email (`client_email` from JSON) as a user with appropriate permissions

## Option 2: OAuth2 (For User Consent Flow)

### 1. Create OAuth2 Credentials
1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - Your production callback URL
5. Download the client ID and secret

### 2. Configure Environment Variables
```env
GOOGLE_CALENDAR_CLIENT_ID="your-oauth-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-oauth-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/auth/google/callback"
```

## Testing the Integration

### 1. Check API Health
Make a GET request to `/google-calendar/health` to verify the connection.

### 2. Test Calendar Creation
The Session module will automatically create calendar events when sessions are booked.

### 3. Monitor Logs
Check the application logs for any Google Calendar API errors or successful operations.

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate service account keys regularly**
4. **Limit service account permissions to minimum required**
5. **Monitor API usage and set up alerts**

## Troubleshooting

### Common Issues

1. **"Calendar API has not been used" Error**
   - Ensure you've enabled the Google Calendar API in your project

2. **Authentication Errors**
   - Verify all credentials are correctly copied
   - Check that the private key preserves line breaks

3. **Permission Denied**
   - Ensure the service account has access to the calendar
   - Check that the calendar ID is correct

4. **Rate Limiting**
   - The service includes automatic retry logic
   - Monitor your API quotas in Google Cloud Console

### Getting Help

1. Check the [Google Calendar API documentation](https://developers.google.com/calendar)
2. Review the application logs for detailed error messages
3. Use the health check endpoint to diagnose connection issues

## Environment Setup Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] Service account created and key downloaded
- [ ] Environment variables configured
- [ ] Calendar permissions set (if using specific calendar)
- [ ] Health check endpoint returns success
- [ ] Test session creation works
