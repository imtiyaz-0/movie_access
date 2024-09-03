const fs = require('fs');
const path = './logs';

if (!fs.existsSync(path)){

    fs.mkdirSync(path, { recursive: true });
}
