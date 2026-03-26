# Travel Tracker
[![Live Website](https://img.shields.io/badge/Live-Website-brightgreen)](https://travel-tracker.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<img src="public/logo_tt.png" width="200">

An interactive map application that helps you track your travels. It can give you total numbers and percentages of how many countries in the world, US states, European countries, Chinese provinces, Indian states, and US national parks you have visited. It also allows you to login and save your travel data to the cloud, and export, share, or download the maps.

## 🎯 Access the Application

**👉 1. The dynamic website**

You can check the dynamic website at https://travel-tracker.org/

**👉 2. The mobile app**

You can download the mobile app from the App Store and Google Play by scanning the QR code below:

![QR Code](docs/figures/download.png)  



## ✨ Features

- 🌍 **World Map View** - Track countries you've visited (~177 countries)
- 🇺🇸 **USA Map View** - Track US states you've visited (50 states)
- 🏞️ **US National Parks View** - Explore and track 63 US national parks
- 🇪🇺 **Europe Map View** - Track European countries you've visited
- 🇨🇳 **China Map View** - Track Chinese provinces you've visited
- 🇮🇳 **India Map View** - Track Indian states and union territories (36 total)
- 🎯 **Interactive Selection** - Click on map or list to select locations
- 🔍 **Search Functionality** - Quickly find countries/states/provinces
- 🏷️ **Labels** - Show labels for selected locations
- 🔍 **Zoom & Pan** - Interactive map navigation with smooth controls
- 💾 **Export** - Save high-quality PNG images (3x resolution)
- 📊 **Statistics** - View count and percentage of visited locations
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎨 **Modern UI** - Glassmorphism design with gradient effects
- 🔐 **Authentication** - Google and Apple login



## 📸 Map Views


<div align="center">

#### 🌍 World Map
![World Map](docs/figures/World.png)

#### 🇺🇸 USA Map
![USA Map](docs/figures/USA.png)

#### 🇪🇺 Europe Map
![Europe Map](docs/figures/Europe.png)

#### 🇨🇳 China Map
![China Map](docs/figures/China.png)

#### 🇮🇳 India Map
![India Map](docs/figures/India.png)

#### 🏞️ US National Parks Map
![US National Parks Map](docs/figures/US_NPs.png)

</div>




## 📖 Documentation

For detailed information on the technical side of the project, please refer to the following guides:

- **[Tech Stack](docs/TECH_STACK.md)**: Technologies and libraries used
- **[Deployment Guide (AWS)](docs/DEPLOY_AWS.md)**: How to deploy to AWS
- **[Mobile Deployment](docs/DEPLOY_MOBILE.md)**: Android & iOS build process
- **[Authentication Setup](docs/AUTH_CONFIG.md)**: Google & Apple login configuration

## ⚠️ Data Accuracy Note

Some data may not be completely accurate. For example: there are generally recognized to be **195 countries** in the world (193 UN member states + 2 observer states), but this application includes **~176 countries/territories** based on the Natural Earth dataset used. The map data is sourced from publicly available GeoJSON/TopoJSON datasets, and the exact count may vary depending on the data source and how territories are classified. This is common across different mapping applications and datasets.


## 📧 Contact

For questions, suggestions, or feedback, please contact maintainer: **changzhiai@gmail.com**
