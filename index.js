const data = require('./input.json');
const getSchedule = require('./getSchedule');
const fs = require('fs');

const output = JSON.stringify(getSchedule(data), null, 2);

fs.writeFile('output.json', output, 'utf8', () => {
});