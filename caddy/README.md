# Caddy Configuration

This folder contains the Caddy reverse proxy configuration for Branvia.

## Files

- `Caddyfile` - Main Caddy configuration file

## Configuration

The Caddyfile is configured to:

1. **Reverse proxy** requests to the web container
2. **Automatic HTTPS** with Let's Encrypt certificates
3. **Security headers** for modern web security
4. **HTTP to HTTPS redirect** for all traffic
5. **Logging** to `/var/log/caddy/access.log`

## Usage

1. **Update the domain** in `Caddyfile` (replace `yourdomain.com`)
2. **Point your domain's DNS** to your server IP
3. **Deploy** with `pnpm docker:prod`

## Features

- ✅ Automatic SSL certificates
- ✅ Security headers
- ✅ Reverse proxy to web container
- ✅ HTTP to HTTPS redirect
- ✅ JSON logging format
- ✅ Health checks and restart policies

## Migration to Cloudflare

When ready to migrate to Cloudflare:
1. Point DNS to Cloudflare
2. Use Cloudflare's SSL
3. Keep Caddy as reverse proxy or remove it
