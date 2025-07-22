# ApnaGit - A Custom Version Control System

Welcome to ApnaGit! This project is a custom-built, Git-like version control system with a powerful command-line interface (CLI) and a collaborative, cloud-native backend. It allows developers to initialize repositories, track file changes, and collaborate with teammates in real-time.

The entire system, from the local CLI to the deployed backend, was built from scratch over 11 days.

## Core Technologies

- **Backend:** Node.js, Express.js
- **CLI:** Yargs
- **Database:** MongoDB (with Mongoose)
- **Cloud Storage:** AWS S3
- **Real-time Engine:** Socket.IO
- **Deployment:** Render

---

## The 11-Day Development Journey

Here is a day-by-day breakdown of how ApnaGit was developed, showcasing the features added at each stage.

### **Day 1: The Foundation - Local Version Control**

**Objective:** Create the most basic, local-only version control commands.

- **`apna-git init`:** Created a command to initialize a new repository by creating a hidden `.apnaGit` directory in the current folder. This folder is the heart of the local version control system.
- **`apna-git add <file>`:** Implemented the logic to copy a specific file into a `.apnaGit/staging` area, preparing it for the next commit.
- **`apna-git commit <message>`:** Developed the core commit functionality. This command takes all files from the staging area and moves them into a new, unique subfolder within `.apnaGit/commits`, creating a permanent snapshot of the project at that moment.

### **Day 2: Connecting to the Cloud**

**Objective:** Move beyond local-only storage and connect the tool to a persistent, cloud-based backend.

- **AWS S3 Integration:** Configured the AWS SDK.
- **`apna-git push`:** Wrote the logic to scan the local `.apnaGit/commits` directory and upload every file from every commit to a shared AWS S3 bucket.
- **`apna-git pull`:** Implemented the reverse logic to download all commit files from the S3 bucket back into the local `.apnaGit` directory.

### **Day 3: Making the Tool Global**

**Objective:** Transform the project from a script that only runs in its own folder into a true command-line tool that can be run from anywhere on the system.

- **Shebang & `package.json`:** Added `#!/usr/bin/env node` to `index.js` and configured the `bin` field in `package.json`.
- **`npm link`:** Established the workflow for installing the `apna-git` command globally, allowing initialization of repositories in any directory.

### **Day 4: Solving the Multi-Repo Problem**

**Objective:** Fix a major architectural flaw where all projects were pushing to the same S3 "folder", causing conflicts.

- **Unique Repository IDs:** Modified the `apna-git init` command to generate a unique ID (UUID) for each new repository and save it to a local `.apnaGit/config.json` file.
- **Isolated Pushes:** Updated `push` and `pull` commands to use this unique ID as a prefix in S3, ensuring that each repository has its own isolated storage space in the cloud.

### **Day 5: Building the Server Foundation**

**Objective:** Create the centralized backend server to handle user management and collaboration.

- **Express Server:** Built the initial Node.js server using Express.
- **MongoDB Integration:** Set up Mongoose models (`userModel.js`, `repoModel.js`) to define the data structure for users and repositories.
- **API Routes:** Created the initial API routes for user authentication.

### **Day 6: User Authentication**

**Objective:** Implement a secure user signup and login system.

- **`apna-git signup` & `apna-git login`:** Created new CLI commands that prompt the user for credentials.
- **API Endpoints:** The CLI commands communicate with new `/api/signup` and `/api/login` endpoints on the server.
- **JWT Authentication:** The server now uses `bcryptjs` to hash passwords and `jsonwebtoken` to create secure login tokens, which are saved to a global config file on the user's machine.

### **Day 7: Connecting the CLI to the Platform**

**Objective:** Integrate the local version control with the new user authentication system.

- **Protected `init` Command:** The `apna-git init` command was updated to first check if a user is logged in. It then makes an API call to the server to register the new repository and link it to the logged-in user's account in the database.
- **Dynamic Naming:** The `init` command was simplified to automatically use the current folder's name as the repository name.

### **Day 8: Enabling Team Collaboration**

**Objective:** Build the final core feature needed for a teammate to join a project.

- **`apna-git clone <repoId>`:** Implemented the crucial `clone` command. This command creates a new local folder, sets up the `.apnaGit/config.json` file with the correct existing repository ID, and automatically runs `pull` to download all the project files from S3.

### **Day 9: Introducing Real-Time Notifications**

**Objective:** Make the platform feel live and interactive.

- **Socket.IO Integration:** Added Socket.IO to the Express server to create a real-time event hub.
- **Event Emitters:** The `commit` and `push` commands were updated to connect to the server via a WebSocket and send a small notification message after they complete their task.
- **The Listener:** Created a simple `listener.js` script to demonstrate the real-time functionality by connecting to the server and printing live activity updates to the console.

### **Day 10: Enhancing the CLI & Fixing Bugs**

**Objective:** Improve the user experience and fix bugs discovered during testing.

- **`apna-git add .`:** Implemented the ability to add all files in the current directory to the staging area.
- **`clone` Bug Fix:** Debugged and fixed a critical issue where the `clone` command was not correctly creating the `.apnaGit` directory for teammates.
- **Permissions Fix:** Solved a macOS-specific `operation not permitted` error by establishing the correct installation procedure (`chmod +x`).

### **Day 11: Final Polish and Deployment**

**Objective:** Prepare the project for production and document the workflow.

- **Login Enforcement:** Added mandatory login checks to the `add`, `commit`, and `push` commands, ensuring that only authenticated users can interact with repositories.
- **Dynamic Usernames:** Updated the notification system to use the actual username of the logged-in user instead of a placeholder.
- **Render Deployment:** Successfully deployed the backend server to Render, making the platform publicly accessible and ready for team use.
- **Documentation:** Created this README to document the project's features, architecture, and collaborative workflow.

---

## How to Use

This project requires two main components: the deployed server and the local CLI tool.

### Server

The server is already deployed and running on Render.

### CLI Installation (for Teammates)

1.  Get the source code and unzip it.

2.  Run `npm install` inside the folder.

3.  **On macOS/Linux:** Run `chmod +x index.js` to make the script executable.

4.  Run `npm link` to install the `apna-git` command globally.

5.  **Configure AWS Credentials:** This tool needs AWS credentials to interact with the shared S3 bucket. The standard way to do this is with the AWS CLI.
    - If you don't have it, [install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) for your operating system.
    - Once installed, run the configure command in your terminal:
      ```bash
      aws configure
      ```
    - It will prompt you for four pieces of information. Your team lead will provide the first two. You can leave the last two as default.
      - `AWS Access Key ID`: [**PASTE KEY FROM TEAM LEAD**]
      - `AWS Secret Access Key`: [**PASTE SECRET KEY FROM TEAM LEAD**]
      - `Default region name`: `ap-south-1`
      - `Default output format`: `json`

6.  Run `apna-git signup` to create your account.

You are now ready to `clone` repositories and collaborate!
