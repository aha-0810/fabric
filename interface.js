const readline = require('readline');
const crypto = require('crypto');
const WebSocket = require('ws');

// Create readline interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input
function getInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (input) => resolve(input));
  });
}

function generateHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

function generateID() {
  return crypto.randomBytes(4).toString('hex');
}

function generateRandomCode() {
  const min = 1000000; // Minimum 7-digit number
  const max = 9999999; // Maximum 7-digit number
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

function selectFMer() {
  const agencies = [
      { id: '00000001', name: 'Land Ministry Management' },
      { id: '00000002', name: 'Regional Government Management' },
      { id: '00000003', name: 'Local Government Management' }
  ];
  const randomIndex = Math.floor(Math.random() * agencies.length);
  return agencies[randomIndex];
}

// Function to upload data to WebSocket server
function uploadData(data, appId) {
  const ws = new WebSocket('ws://localhost:7890');

  ws.on('open', function open() {
    ws.send(JSON.stringify({ appId, ...data }));
  });
}

async function main() {
  let continueRunning = true;

  while (continueRunning) {
    // Get reporterID, location, description 
    const reporterID = await getInput('Please enter your ID:\n');
    const description = await getInput('Please enter description and upload image of defection:\n');

    // Generate reportID, hash for image, agencyID, agencyName
    const reportID = generateID();
    const sectionID = generateRandomCode();
    const imageHash = generateHash(description);
    const FMer = selectFMer();

    // Construct the data objects
     // Construct the data objects
     const data = {
      reportID,
      reporterID, 
      sectionID, 
      description, 
      imageHash, 
      fmerID: FMer.id, // Use the selected FMer's ID
      fmerName: FMer.name // Use the selected FMer's name
    };

    // Upload the data to WebSocket server with respective appIds
    uploadData(data, '1-2');
  }

  // Close the readline interface
  rl.close();
  console.log('Program has ended.');
}


// Run the main function
main();
