# Dental Image Management System Documentation

## System Overview
The application is a comprehensive dental image management system designed for dentists to:
- Manage patient records (CRUD operations)
- Upload and manage both 2D images and 3D models (STL/PLY files)
- Edit 2D dental images
- View 3D dental models
- Organize files by patient
- Secure data access based on dentist authentication

## Firebase Architecture

### 1. Authentication (Firebase Auth)
- Manages dentist accounts
- Handles login/logout operations
- Provides security tokens for access control

### 2. Cloud Firestore (Database)
Database Structure:
