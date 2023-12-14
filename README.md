# Vacation Auto-Reply App with Gmail APIs
Automate your email responses during your vacation with this Node.js Express app using Gmail APIs. The app periodically checks emails and sends an auto-reply, creating a label for identified vacation-related emails.

## Features
* Gmail API Integration: Utilizes Gmail APIs for reading and sending emails.
* Automatic Reply: Sends automated vacation replies to incoming emails.
* Label Creation: Automatically creates a label for vacation-related emails.
* Periodic Check: Checks emails every 60-120 seconds for timely responses.

# Setup
1. Node.js Installation:
   * Make sure you have Node.js installed. If not, download it from https://nodejs.org/.
2. Gmail API Configuration:
   * Create a new project on the Google Cloud Console.
   * Enable the Gmail API and download the credentials.json file.
   * Place the credentials.json in the root directory of your project.
3. Project Setup:
   * Clone this repository: `git clone <repository-url>`.
   * Navigate to the project directory: `cd <project-directory>`
4. Dependency Installation:
   * Run npm install to install the project dependencies.
5. Configuration:
   *Configure your Gmail API credentials and other settings in the config.js file.
6. Run the App:
   * Execute npm start to launch the app.
# Configuration
1. Gmail API Credentials:
   * Replace the credentials.json file with your own Gmail API credentials.
2. App Configuration:
   * Adjust settings such as the auto-reply message and check interval in config.js.
# Usage
1. Start the App:
   * Run the app using npm start.
2. Access the App:
   * Visit http://localhost:3000 to access the app.
3. Authorize Access:
   * Follow the on-screen instructions to authorize access to your Gmail account.
4. Enjoy Your Vacation:
   * The app will automatically reply to incoming emails and create a label for vacation-related emails.

# Contributing
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -am 'Add new feature'`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Submit a pull request.

# License
This project is licensed under the MIT License - see the [LICENSE]() file for details.

# Acknowledgments
1. Node.js: https://nodejs.org/
2. Gmail API: https://developers.google.com/gmail



