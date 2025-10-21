# Navigation Structure & Routing Guide

## Overview

This document outlines the complete navigation structure and routing implementation for the Get Your Fit Together application, designed to meet all project requirements and provide an intuitive user experience.

## Route Structure

### 🌐 Public Routes (No Authentication Required)

#### `/` - Home/Explore Page

- **Purpose**: Public landing page showcasing public workouts
- **Access**: Anyone (authenticated and unauthenticated users)
- **Features**:
  - Hero section with app branding
  - Display of public workouts (read-only)
  - Call-to-action buttons for login/signup
  - Responsive grid layout for workout cards
  - No CRUD operations or favoriting allowed

### 🔐 Protected Routes (Authentication Required)

All routes under `/dashboard/*` require user authentication and are protected by the dashboard layout.

#### `/dashboard` - Main Dashboard

- **Purpose**: User's personal workout management hub
- **Features**:
  - Display user's own workouts (CRUD list)
  - Create new workout button
  - Quick actions section
  - Favorite buttons on workout cards
  - Edit/Delete buttons for owned workouts

#### `/dashboard/workouts/[id]` - Workout Details

- **Purpose**: View individual workout with exercises
- **Features**:
  - Workout information display
  - Favorite toggle button
  - Exercise list (1:N relationship)
  - Add exercise button (for owners)
  - Edit workout button (for owners)

#### `/dashboard/workouts/new` - Create Workout

- **Purpose**: Form to create new workouts
- **Features**:
  - Workout form with validation
  - Redirect to dashboard after creation
  - Back navigation

#### `/dashboard/workouts/[id]/edit` - Edit Workout

- **Purpose**: Form to edit existing workouts
- **Features**:
  - Pre-populated form with current data
  - Update functionality
  - Redirect to workout details after update

#### `/dashboard/workouts/[id]/exercises/new` - Add Exercise

- **Purpose**: Form to add exercises to a workout
- **Features**:
  - Exercise form (name, sets, reps, notes)
  - 1:N relationship implementation
  - Redirect to workout details after creation

#### `/dashboard/favorites` - Favorites Page

- **Purpose**: Display user's favorited workouts
- **Features**:
  - List of favorited workouts (M:N relationship)
  - Unfavorite functionality
  - Quick actions section
  - Empty state with helpful guidance

#### `/dashboard/profile` - Profile Page

- **Purpose**: User profile management
- **Features**:
  - 1:1 relationship with profiles table
  - Editable profile information
  - Read-only email display
  - Profile creation/update functionality

### 🔑 Authentication Routes

#### `/login` - Login Page

- **Purpose**: User authentication
- **Features**:
  - Email/password login form
  - Redirect to dashboard after login
  - Link to signup page

#### `/signup` - Signup Page

- **Purpose**: User registration
- **Features**:
  - Registration form with validation
  - Profile creation
  - Email verification flow
  - Redirect to login after signup

## Navigation Bar

### Unauthenticated State

- 🏠 Home
- 🔑 Log In
- 📝 Sign Up

### Authenticated State

- 🏠 Home
- 🏋️ Dashboard
- ❤️ Favorites
- 👤 Profile
- 🚪 Logout

## Access Control

### Public Access

- `/` - Home page with public workouts

### Protected Access

- All `/dashboard/*` routes require authentication
- Automatic redirect to `/login` for unauthenticated users
- Dashboard layout enforces authentication

## Database Relationships Demonstrated

### 1:1 Relationship

- **Users ↔ Profiles**: Each user has one profile record
- **Implementation**: Profile page allows editing user profile data

### 1:N Relationship

- **Workouts ↔ Exercises**: Each workout can have multiple exercises
- **Implementation**: Workout details page shows exercise list with add/edit functionality

### M:N Relationship

- **Users ↔ Workouts (via Favorites)**: Users can favorite multiple workouts, workouts can be favorited by multiple users
- **Implementation**: Favorites table with user_id and workout_id foreign keys

## Reviewer Journey

The application is designed to allow reviewers to easily follow this sequence:

1. **Visit `/`** → See public workouts → ✅ Public Access
2. **Click "Sign Up" or "Log In"** → Authenticate
3. **Land on `/dashboard`** → See own workouts → ✅ CRUD list
4. **Click a workout** → View exercises → ✅ 1:N relationship
5. **Favorite a workout** → ✅ M:N relationship
6. **Go to `/dashboard/favorites`** → See favorites
7. **Go to `/dashboard/profile`** → See editable profile (1:1)
8. **Log out** → Back to `/`

## Technical Implementation

### Components

- `Navigation.tsx` - Responsive navigation bar with auth state
- `ProtectedRoute.tsx` - Route protection wrapper
- `FavoriteButton.tsx` - Reusable favorite toggle component

### Layouts

- `layout.tsx` - Root layout with navigation
- `dashboard/layout.tsx` - Protected dashboard layout

### State Management

- Authentication state via `useAuth` hook
- Form state via React Hook Form
- Optimistic UI updates for favorites

### Styling

- Tailwind CSS for responsive design
- Consistent color scheme (cyan/blue theme)
- Mobile-first responsive design

## Security Features

- Row Level Security (RLS) policies on all tables
- User-specific data access controls
- Protected route enforcement
- Form validation and error handling
- Secure authentication flow

This structure ensures a clear separation between public and private areas while maintaining an intuitive user experience and demonstrating all required database relationships.
