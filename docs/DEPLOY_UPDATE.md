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
