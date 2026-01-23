
## Step 6: Connect Custom Domain (travel-tracker.org)

To connect your domain `travel-tracker.org` to your EC2 instance, you need to configure DNS settings and set up reverse proxy.

### 1. Configure DNS (GoDaddy, Namecheap, Route53, etc.)

Log in to where you bought your domain and manage DNS records.

1.  **A Record**:
    *   **Host/Name**: `@` (root)
    *   **Value/IP**: `54.151.8.244`
    *   **TTL**: 3600 (or Automatic)

2.  **CNAME Record** (Optional, for www):
    *   **Host/Name**: `www`
    *   **Value/Target**: `travel-tracker.org` (or `@`)

*Note: DNS propagation can take 1-48 hours, but usually happens within minutes.*

### 2. Configure Nginx Reverse Proxy (Recommended)

Using Nginx allows you to serve on port 80 (HTTP) instead of 3001, and makes SSL (HTTPS) setup easier later.

1.  **Install Nginx on EC2**:
    ```bash
    sudo apt update
    sudo apt install nginx -y
    ```

2.  **Allow Port 80 in AWS Security Group**:
    *   Go to AWS Console -> EC2 -> Security Groups.
    *   Edit Inbound Rules.
    *   Add Rule: **HTTP** (Port 80), Source: **0.0.0.0/0**.

3.  **Configure Nginx**:
    Create a config file:
    ```bash
    sudo nano /etc/nginx/sites-available/travel-tracker
    ```

    Paste this content:
    ```nginx
    server {
        listen 80;
        server_name travel-tracker.org www.travel-tracker.org;

        location / {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    *Save and exit (Ctrl+X, Y, Enter).*

4.  **Enable the Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/travel-tracker /etc/nginx/sites-enabled/
    sudo nginx -t  # Test configuration
    sudo systemctl restart nginx
    ```

### 3. Setup HTTPS (SSL) with Certbot (Free)

1.  **Install Certbot**:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```

2.  **Get Certificate**:
    ```bash
    sudo certbot --nginx -d travel-tracker.org -d www.travel-tracker.org
    ```
    *Follow the prompts (enter email, agree to terms).*

3.  **Verify**:
    Visit `https://travel-tracker.org`. It should be secure and load your app!
