# API Key Encryption Setup

## Quick Start

The settings page now encrypts all API keys before storing them in Convex. To use this feature, you must set an encryption key.

### 1. Generate Encryption Key

Generate a secure 32-byte (64 hex character) encryption key:

```bash
openssl rand -hex 32
```

This will output something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

### 2. Set Environment Variable in Convex

Set the encryption key as a Convex environment variable:

```bash
npx convex env set API_KEY_ENCRYPTION_KEY <your-generated-key>
```

Replace `<your-generated-key>` with the output from step 1.

**Example**:
```bash
npx convex env set API_KEY_ENCRYPTION_KEY a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 3. Verify

Check that the key was set:

```bash
npx convex env list
```

You should see `API_KEY_ENCRYPTION_KEY` in the list.

## How It Works

- **Encryption**: When you save an API key in settings, it's encrypted using AES-256-GCM before being stored in the database
- **Client Security**: API keys are NEVER sent to the client (not even encrypted). The client only receives boolean flags (`hasClaudeKey`, `hasReadwiseKey`) indicating if keys exist.
- **Security**: Keys are never stored or transmitted in plain text

## Important Notes

- **Keep the encryption key secure**: If you lose it, encrypted keys cannot be recovered
- **Backup the key**: Store it securely (e.g., password manager) as you'll need it to decrypt keys when making API calls server-side
- **Security Note**: Keys are only decrypted server-side when needed for API calls. They are never exposed to the client.
- **Production**: Use different keys for development and production environments
- **Key Rotation**: If you need to rotate keys, you'll need to re-encrypt all existing keys (future enhancement)

## Troubleshooting

### Error: "API_KEY_ENCRYPTION_KEY environment variable is not set"

**Solution**: Run `npx convex env set API_KEY_ENCRYPTION_KEY <key>` to set the encryption key.

### Error: "API_KEY_ENCRYPTION_KEY must be exactly 64 hex characters"

**Solution**: The key must be exactly 64 hexadecimal characters (32 bytes). Generate a new one with `openssl rand -hex 32`.

### Error: "Invalid encrypted data format"

**Cause**: Existing keys in the database were stored before encryption was enabled.

**Solution**: 
1. Clear existing API keys from the database (via Convex dashboard or migration)
2. Users will need to re-enter their API keys (they'll be encrypted on save)

