# Deploying to AWS EC2

This guide describes how to deploy the Travel Tracker application to an AWS EC2 instance. This is the recommended approach as it supports the SQLite database natively.

## Prerequisites

1.  **AWS Account**: You need access to the AWS Console.
2.  **GitHub Repository**: Ensure your code is pushed to GitHub.

## Step 1: Launch an EC2 Instance

1.  Log in to the **AWS Console** and go to **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `TravelTracker-Server`.
4.  **OS Image**: Choose **Ubuntu** (Ubuntu Server 24.04 LTS or 22.04 LTS).
5.  **Instance Type**: `t2.micro` or `t3.micro` (Free tier eligible).
6.  **Key Pair**: Create a new key pair (e.g., `travel-key`), download the `.pem` file, and keep it safe.
7.  **Network Settings**:
    *   Allow SSH traffic from **My IP**.
    *   Allow HTTP traffic from the internet.
    *   Allow HTTPS traffic from the internet.
8.  Click **Launch Instance**.

## Step 2: Connect to the Instance

1.  Open your terminal.
2.  Move your `.pem` key to a secure location and fix permissions:
    ```bash
    chmod 400 path/to/travel-key.pem
    ```
3.  Connect via SSH:
    ```bash
    ssh -i path/to/travel-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
    ssh -i bin/traveltracker-key.pem ubuntu@54.151.8.244
    ```

## Step 3: Install and Setup

We have provided a setup script to automate the installation.

1.  On the server, run the following commands to install Node.js, Git, and PM2:

    ```bash
    # Update system
    sudo apt update && sudo apt upgrade -y

    # Install Node.js (v20)
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs

    # Install Git
    sudo apt install git -y

    # Install PM2 (Process Manager)
    sudo npm install -g pm2
    ```

## Step 4: Deploy the Application

1.  **Clone your repository**:
    ```bash
    git clone https://github.com/changzhiai/travel-tracker.git
    cd travel-tracker
    ```

2.  **Install Dependencies**:
    ```bash
    # Install root dependencies
    npm install

    # Install server dependencies
    cd server
    npm install
    cd ..
    ```

3.  **Build the Application**:
    ```bash
    npm run build
    ```

4.  **Nginx and SSL Setup**:

    Follow the instructions in [Nginx and SSL Setup](docs/DEPLOY_DOMAIN.md).

    ```bash
    # Install Nginx
    sudo apt install nginx -y

    # Configure Nginx
    sudo nano /etc/nginx/sites-available/travel-tracker
    ```

    Final configuration:
    ```nginx
    server {
        server_name travel-tracker.org www.travel-tracker.org;

        location / {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        listen 443 ssl; # managed by Certbot
        ssl_certificate /etc/letsencrypt/live/travel-tracker.org/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/travel-tracker.org/privkey.pem; # managed by Certbot
        include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


    }
    server {
        if ($host = www.travel-tracker.org) {
            return 301 https://$host$request_uri;
        } # managed by Certbot


        if ($host = travel-tracker.org) {
            return 301 https://$host$request_uri;
        } # managed by Certbot


        listen 80;
        server_name travel-tracker.org www.travel-tracker.org;
        return 404; # managed by Certbot
    }
    ```

    Enable the site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/travel-tracker /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

5.  **Start the Server**:
    ```bash
    # Start with PM2 to keep it running in background
    pm2 start npm --name "travel-tracker" -- run start
    
    # Save PM2 list so it restarts on reboot
    pm2 save
    pm2 startup
    ```

5.  **Configure Firewall (Security Group)**:
    By default, the app runs on port `3001`. You need to allow this port in AWS.
    *   Go to **EC2 Console** -> **Security Groups** (select the one for your instance).
    *   **Edit inbound rules**.
    *   Add Rule: **Custom TCP**, Port **3001**, Source **0.0.0.0/0** (Anywhere).
    *   Save rules.

## Step 5: Access the App

Open your browser and visit:
`http://YOUR_EC2_PUBLIC_IP:3001`

---

## Step 6: Updates

When you make changes to your code:

1.  Push changes to GitHub.
2.  SSH into your server.
3.  Pull and restart:
    ```bash
    cd travel-tracker
    git pull origin dev
    npm install
    # Rebuild frontend if needed
    npm run build
    # Restart server
    pm2 restart travel-tracker
    ```

## Optional: Using Docker

If you prefer using Docker, a `Dockerfile` is included in the project root.

1.  Build image: `docker build -t travel-tracker .`
2.  Run container: `docker run -p 3001:3001 -d travel-tracker`

*Note: With Docker, the SQLite database inside the container will reset if the container is removed, unless you mount a volume.*

# Updating the Deployment

Follow these steps to update the application on the production server.

## 1. Connect to the Server

SSH into your AWS EC2 instance:
```bash
ssh -i bin/traveltracker-key.pem ubuntu@54.151.8.244
```

## 2. Navigate to Project Directory

```bash
cd travel-tracker
```

## 3. Pull Latest Changes

Pull the latest changes from the `dev` branch:
```bash
git pull origin dev
```

## 4. Rebuild the Application

Install any new dependencies and rebuild the frontend:
```bash
npm install
npm run build
```

## 5. Restart the Server

Restart the PM2 process to apply changes:
```bash
pm2 restart travel-tracker
```
