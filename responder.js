const successMessages = [
  'As you wish',
  'Ok',
  'With pleasure',
  'Alright',
  'Done',
  'Sure thing',
  'Always happy to serve',
  'Always happy to help',
  'No problem mate',
  'Affirmative',
  "You're welcome",
  "K",
];

const errorMessages = [
  "Sorry I didn't understand that.",
  "Come again?",
  "Once more please?",
  "Once with feeling?",
  "what?",
]

function success() {
  return successMessages[Math.floor(Math.random() * successMessages.length)];
}

function error() {
  return errorMessages[Math.floor(Math.random() * errorMessages.length)];
}

module.exports.success = success;
module.exports.error = error;