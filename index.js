const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const credentials = require('./credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = 'token.json';

const MIN_INTERVAL = 45000; 
const MAX_INTERVAL = 120000; 

const CHECK_INTERVAL = Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL; // Random interval between 45 to 120 seconds


authorize(credentials, startAutoReplyLoop);

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function startAutoReplyLoop(auth) {
  setInterval(() => {
    sendAutoReply(auth);
  }, CHECK_INTERVAL);
}

function sendAutoReply(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  //content for auto-reply
  const message = 'Thank you for your email. I am currently on vacation and will respond to your message as soon as possible.';

  // List messages in the inbox
  gmail.users.messages.list({ userId: 'me', labelIds: 'INBOX', maxResults: 1 }, (err, res) => {
    if (err) return console.error('The API returned an error:', err.message);

    if (res.data.resultSizeEstimate > 0) {
      const messageId = res.data.messages[0].id;

      // Get the sender's email address
      gmail.users.messages.get({ userId: 'me', id: messageId }, (err, res) => {
        if (err) return console.error('The API returned an error:', err.message);

        const isRead = !(res.data.labelIds && res.data.labelIds.includes('UNREAD'));

        // Check if the email is marked as read
        if (isRead) {
          console.log('Email is marked as read. Skipping auto-reply.');
          return;
        }

        const senderEmail = res.data.payload.headers.find(header => header.name === 'From').value;

        const yourGmailAddress = 'abhishektyagi2912@gmail.com';

        // Check if the sender is not yourself
        if (senderEmail !== yourGmailAddress) {

          sendEmail(gmail, senderEmail, message, messageId, () => {
            // Check if the "vacation" label already exists
            checkVacationLabel(gmail, messageId, (labelId) => {
              if (labelId) {
                // "vacation" label exists
                moveEmailAndMarkAsRead(gmail, messageId, labelId);
              } else {
                // "vacation" label doesn't exist, create the label and move 
                createVacationLabelAndMoveEmail(gmail, messageId);
              }
            });
          });
        } else {
          console.log('Email from yourself. Skipping auto-reply.');
        }
      });
    } else {
      console.log('No new emails found.');
    }
  });
}


function sendEmail(gmail, to, body, messageId, callback) {
  const headers = [
    `From: "Abhishek" abhishektyagi2912@gmail.com`, 
    `To: ${to}`,
    `Subject: Auto Reply: On Vacation`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    body,
  ];

  const raw = headers.join('\r\n').trim();

  gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: Buffer.from(raw).toString('base64'),
    },
  }, (err, res) => {
    if (err) return console.error('The API returned an error:', err.message);

    console.log('Auto-reply sent successfully.');
    callback();
  });
}

function checkVacationLabel(gmail, messageId, callback) {
  // Check if the "vacation" label exists
  gmail.users.labels.list({ userId: 'me' }, (err, res) => {
    if (err) return console.error('The API returned an error:', err.message);

    const vacationLabel = res.data.labels.find(label => label.name === 'vacation');
    const labelId = vacationLabel ? vacationLabel.id : null;

    callback(labelId);
  });
}

function createVacationLabelAndMoveEmail(gmail, messageId) {
  // Create the "vacation" label
  gmail.users.labels.create({
    userId: 'me',
    resource: {
      name: 'vacation',
      messageListVisibility: 'show',
      labelListVisibility: 'labelShow',
      color: {
        textColor: '#ffffff',
        backgroundColor: '#000000', 
      },
    },
  }, (err, label) => {
    if (err) return console.error('Error creating label:', err.message);

    // Move the replied email to the "vacation" label
    moveEmailAndMarkAsRead(gmail, messageId, label.data.id);
  });
}

function moveEmailAndMarkAsRead(gmail, messageId, labelId) {
  // Move the replied email to the "vacation" label and mark as read
  gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    resource: {
      addLabelIds: [labelId],
      removeLabelIds: ['INBOX'], // Remove from the inbox
      removeLabelIds: ['UNREAD'], // Mark the email as read
    },
  }, (err, res) => {
    if (err) return console.error('Error modifying email:', err.message);

    console.log('Email moved to the "vacation" label and marked as read.');
  });
}
