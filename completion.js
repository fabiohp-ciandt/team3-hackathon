const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const azureApiKey = "" ;
const endpoint = "";
const acorn = require('acorn');
const walk = require('acorn-walk');
const maxTokens = 2048; // Set a specific maximum token limit

const exampleCode = `
function someFunction() {
  console.log('This is a console.log() example.');
}
`;


function analyzeCode(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 'latest' });
    let issues = [];

    // Helper function to check if a node is a console.log() call
    function isConsoleLog(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'console' &&
        node.callee.property.name === 'log'
      );
    }

    // Visitor pattern to traverse the AST
    walk.simple(ast, {
      CallExpression(node) {
        if (isConsoleLog(node)) {
          issues.push({
            message: '',
            location: node.loc
          });
        }
      }
    });

    return issues;
  } catch (error) {
    console.error(error)
    console.error('Code parsing error:', error.message);
    return [];
  }
}


async function generateFeedback(issue) {
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const prompt = `In the code, there's a call to console.log(). Consider using a custom logging function instead.`;
    const completions = await client.getCompletions("text-davinci-003", prompt, { maxTokens });
    const suggestion = completions.choices[0].text.trim();
    return `${issue.message} Suggestion: ${suggestion}`;
  }
  
async function analyzeAndProvideFeedback(code) {
const issues = analyzeCode(code);
const feedback = [];
for (const issue of issues) {
    const suggestion = await generateFeedback(issue);
    feedback.push(suggestion);
}
return feedback;
}

function displayFeedback(feedback) {
if (feedback.length === 0) {
    console.log('No issues found in the code. Good job!');
} else {
    console.log('Issues and suggestions:');
    feedback.forEach((message) => console.log('-', message));
}
}
  
async function main() {
    console.log('== Code Analysis and Feedback Tool ==');
    const feedback = await analyzeAndProvideFeedback(exampleCode);
    displayFeedback(feedback);
  }


// Prompt the user for input
function promptUser() {
  process.stdout.write('Enter your input: ');
}

// Event handler for when the user enters input
function onUserInput(data) {
  // Process the user input (data)
  const userInput = data.toString().trim(); // Convert the input buffer to a string and remove trailing newline characters

  // Your logic with the user input
  console.log('You entered:', userInput);

  // Stop listening for further input
  process.stdin.removeListener('data', onUserInput);

  // Optionally, you can exit the process if needed
  // process.exit();
}

// Listen for user input
process.stdin.on('data', onUserInput);

// Start the prompt
// if (promptUser()){
//   console.log
  main();
// }
  

