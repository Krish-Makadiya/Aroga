# Arogya

**Your Health, Our Priority - Empowering Wellness with AI.**

Arogya is a comprehensive healthcare platform that connects patients, doctors, and pharmacies in a unified ecosystem. The platform leverages AI-powered health insights to provide personalized healthcare services, appointment management, and seamless communication between healthcare providers and patients.

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **React Router** - Routing
- **Clerk** - Authentication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Clerk** - Authentication middleware
- **Google Gemini AI** - AI health insights
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Clerk Account** (for authentication)
- **Google Gemini API Key** (for AI features)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Arogya
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables Setup

#### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT =5000

# Clerk Authentication
CLERK_SECRET_KEY = sk_test_your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY = pk_test_your_clerk_publishable_key_here

# MongoDB Connection
MONGODB_URI = mongodb://127.0.0.1:27017/arogya

# Google Gemini AI
GOOGLE_GEMINI_API_KEY = your_google_gemini_api_key_here
```

**How to get these values:**

- **CLERK_SECRET_KEY**: 
  1. Sign up at [Clerk](https://clerk.com)
  2. Create account if not already
  3. Create a new application with default settings (Google and email selected)
  4. Go to Configure section
  5. Scroll down to API keys on left side 
  6. Select React and paste the keys to env files to their respective names

- **MONGODB_URI**: 
  - For local MongoDB: `mongodb://127.0.0.1:27017/arogya`
  - For MongoDB Atlas: Create a cluster and get the connection string from the Atlas dashboard

- **GOOGLE_GEMINI_API_KEY**: 
  1. Go to [Google AI Studio](https://aistudio.google.com/)
  2. Create account if not already
  3. On bottom left there will be Get API keys
  4. press Create API key and then create one with any/default project
  5. Copy the API key and paste it to env files

#### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Backend API URL
VITE_SERVER_URL=http://localhost:5000
```

**How to get these values:**

- **VITE_CLERK_PUBLISHABLE_KEY**: 
  1. In your Clerk dashboard
  2. Go to API Keys section
  3. Copy the Publishable Key (starts with `pk_test_` or `pk_live_`)

- **VITE_SERVER_URL**: 
  - For development: `${import.meta.env.VITE_SERVER_URL}`
  - For production: Your deployed backend server URL


### 4. Run the Application

#### Start the Backend Server

```bash
cd server
npm start
```

The server will start on `${import.meta.env.VITE_SERVER_URL}` (or the PORT specified in your `.env` file).

#### Start the Frontend Development Server

Open a new terminal:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default port).

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
Arogya/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── Dashboard/      # Dashboard components
│   │   │   ├── LandingPage/    # Landing page components
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── patientPages/
│   │   │   ├── doctorPages/
│   │   │   └── pharmacyPages/
│   │   ├── context/            # React context providers
│   │   ├── config/             # Configuration files
│   │   └── styles/             # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express application
│   ├── config/                 # Configuration files
│   │   ├── mongoDB.js          # MongoDB connection
│   │   └── ai.config.js        # AI configuration
│   ├── controllers/            # Route controllers
│   ├── routes/                 # API routes
│   ├── schema/                 # MongoDB schemas
│   ├── index.js                # Entry point
│   ├── package.json
│   └── .env                    # Environment variables (not in git)
│
└── README.md
```

## 🤝 Contributing

We welcome contributions from the open-source community! Here's how you can contribute to Arogya:

### Getting Started with Contributions

1. **Fork the Repository**
   - Click the "Fork" button on the GitHub repository page
   - This creates a copy of the repository in your GitHub account

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/Arogya.git
   cd Arogya
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Set Up the Development Environment**
   - Follow the [Getting Started](#-getting-started) section above
   - Make sure all environment variables are configured
   - Ensure both frontend and backend are running without errors

5. **Make Your Changes**
   - Write clean, readable code
   - Follow the existing code style and conventions
   - Add comments for complex logic
   - Test your changes thoroughly

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Description of your changes"
   ```
   
   **Commit Message Guidelines:**
   - Use clear, descriptive commit messages
   - Prefix with type: `Add:`, `Fix:`, `Update:`, `Remove:`, `Refactor:`, `Docs:`
   - Example: `Add: User profile picture upload feature`

7. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template with:
     - Description of changes
     - Screenshots (if UI changes)
     - Testing instructions
     - Related issues (if any)

### Contribution Guidelines

#### Code Style
- **JavaScript/React**: Follow ESLint rules (already configured)
- **Indentation**: Use 4 spaces (as per existing codebase)
- **Naming**: Use camelCase for variables/functions, PascalCase for components
- **Comments**: Add JSDoc comments for functions and complex logic

#### Testing
- Test your changes locally before submitting
- Test on different browsers if making UI changes
- Ensure backend API endpoints work correctly
- Check for console errors and warnings

#### Pull Request Process
1. **Keep PRs focused**: One feature or fix per PR
2. **Update documentation**: If you add features, update relevant docs
3. **Write clear descriptions**: Explain what and why, not just how
4. **Link issues**: Reference related issues in your PR description
5. **Be responsive**: Address review comments promptly

#### Areas Where Contributions Are Welcome

- 🐛 **Bug Fixes**: Report and fix bugs
- ✨ **New Features**: Add new functionality
- 📝 **Documentation**: Improve README, add code comments
- 🎨 **UI/UX Improvements**: Enhance user interface and experience
- ⚡ **Performance**: Optimize code and improve load times
- 🧪 **Testing**: Add unit tests, integration tests
- 🔒 **Security**: Identify and fix security vulnerabilities
- 🌐 **Internationalization**: Add support for multiple languages
- ♿ **Accessibility**: Improve accessibility features

### Reporting Issues

If you find a bug or have a feature request:

1. **Check Existing Issues**: Search existing issues to avoid duplicates
2. **Create an Issue**: 
   - Use clear, descriptive titles
   - Provide steps to reproduce (for bugs)
   - Include screenshots if applicable
   - Specify your environment (OS, Node version, etc.)

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 📝 Available Scripts

### Frontend (client/)

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend (server/)

```bash
npm start        # Start development server with nodemon
```

## 🔒 Security

- Never commit `.env` files or sensitive keys
- Use environment variables for all secrets
- Keep dependencies updated
- Report security vulnerabilities privately

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) for authentication
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- All contributors who help improve this project

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Contact the maintainers

---

**Made with ❤️ for better healthcare**

