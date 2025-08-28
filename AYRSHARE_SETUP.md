# Ayrshare Integration Setup Guide

This guide will help you set up the Ayrshare social media integration for your ContentClip AI application.

## Prerequisites

1. **Ayrshare Business Account**: You need a Business plan or higher to use the JWT SSO functionality
2. **Integration Package**: You should have received a package containing:
   - Your private key file (`private.key`)
   - Your domain (e.g., `id-8ig3h`)
   - Your API key
   - Sample Postman configuration

## Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# Ayrshare Integration Configuration
AYRSHARE_API_KEY=your_ayrshare_api_key_here
AYRSHARE_DOMAIN=your_ayrshare_domain_here

# Your Ayrshare Private Key (required for JWT generation)
# Option 1: Direct private key (recommended for development)
AYRSHARE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your_private_key_content_here
-----END RSA PRIVATE KEY-----"

# Option 2: Base64 encoded private key (alternative)
AYRSHARE_PRIVATE_KEY_B64=base64_encoded_private_key_here

# Public environment variables (accessible in browser)
NEXT_PUBLIC_AYRSHARE_API_KEY=your_ayrshare_api_key_here
NEXT_PUBLIC_AYRSHARE_DOMAIN=your_ayrshare_domain_here
```

## Private Key Setup

### Option 1: Environment Variable (Recommended)

Copy your private key content directly into the `AYRSHARE_PRIVATE_KEY` environment variable. Make sure to preserve all newlines and formatting.

### Option 2: File-based (Alternative)

Place your `private.key` file in the project root and update the JWT route to read from it.

### Option 3: Base64 Encoded

Encode your private key in base64 and use the `AYRSHARE_PRIVATE_KEY_B64` environment variable.

## Testing the Integration

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Navigate to the Dashboard** and go to the "Social" tab

3. **Click "Connect Social Accounts"** to test the SSO login

4. **Check the browser console** for any error messages

5. **Verify JWT generation** by checking the Network tab in DevTools

## Troubleshooting

### Common Issues

1. **"Private key not configured" error**:

   - Ensure your environment variables are set correctly
   - Check that the private key format is valid RSA PEM
   - Verify the key is being loaded in the JWT route

2. **"JWT generation failed" error**:

   - Check your API key is valid
   - Ensure your domain matches your Ayrshare account
   - Verify the private key is properly formatted

3. **SSO window doesn't open**:
   - Check for popup blockers
   - Verify the JWT is being generated successfully
   - Check browser console for errors

### Debug Tools

Use the "Debug PEM" button in the Social tab to verify your private key configuration.

### Testing with Postman

1. Import the sample Postman configuration from your integration package
2. Add your Profile Key to the request body
3. Test the `/api/ayrshare/jwt` endpoint directly

## Security Notes

- **Never commit your private key** to version control
- **Use environment variables** for sensitive configuration
- **Rotate your API keys** regularly
- **Monitor API usage** through the Ayrshare dashboard

## API Endpoints

The integration provides the following endpoints:

- `POST /api/ayrshare/jwt` - Generate JWT for SSO login
- `GET /api/ayrshare/user` - Get user profile data
- `GET /api/ayrshare/analytics` - Get social media analytics

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment configuration
3. Test with the debug tools provided
4. Contact Ayrshare support with your domain: `id-8ig3h`

## Next Steps

After successful setup:

1. **Connect your social media accounts** through the SSO interface
2. **Configure posting schedules** for automated content
3. **Set up analytics tracking** for performance monitoring
4. **Explore the API endpoints** for custom integrations
