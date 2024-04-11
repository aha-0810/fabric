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

function generateID() {
  return crypto.randomBytes(4).toString('hex');
}

function selectReporter() {
  const users = [
      { name: 'user1', mobile: '010-1234-0011', bankaccount: 'woori'},
      { name: 'user2', mobile: '010-1234-0022', bankaccount: 'woori'},
      { name: 'user3', mobile: '010-1234-0033', bankaccount: 'woori' }
  ];
  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}

function selectContractor() {
    const contractors = [
        { staffname: 'Kim', staffmobile: '010-1234-0111', bankaccount: 'woori'},
        { staffname: 'Lee', staffmobile: '010-1234-0222', bankaccount: 'woori'},
        { staffname: 'Park', staffmobile: '010-1234-0333', bankaccount: 'woori'}
    ];
    const randomIndex = Math.floor(Math.random() * contractors.length);
    return contractors[randomIndex];
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
    // Get sectionID, workID
    const sectionID = await getInput('Please enter sectionID:\n');
    const workID = await getInput('Please enter workID:\n');
    const reporterID = await getInput('Please enter reporterID:\n');
    const contractorID = await getInput('Please enter contractorID:\n');
    const contractorName = await getInput('Please enter contractorName:\n');
  
    // Generate rewardID, reporter and contractor information
    const rewardID = generateID();
    const reporter = selectReporter();
    const contractor = selectContractor();

    // Construct the data objects
     const data = {
      rewardID, 
      sectionID, 
      workID, 
      reporterID, 
      reporterName: reporter.name, 
      reporterMobile: reporter.mobile, 
      reporterBankAccount: reporter.bankaccount, 
      contractorID,
      contractorName, 
      contractorStaffName: contractor.staffname, 
      contractorStaffMobile: contractor.staffmobile, 
      contractorBankAccount: contractor.bankaccount
    };

    // Upload the data to WebSocket server with respective appIds
    uploadData(data, '3-2');
  }

  // Close the readline interface
  rl.close();
  console.log('Program has ended.');
}


// Run the main function
main();
