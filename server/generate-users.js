const fs = require('fs');
const { faker } = require('@faker-js/faker'); // Updated package import

const generateUsers = (numUsers) => {
  const users = [];
  for (let i = 0; i < numUsers; i++) {
    users.push({
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password()
    });
  }
  return users;
};

const numUsers = 1000; // Change this number as needed
const users = generateUsers(numUsers);

const csvContent = 'email,username,password\n' +
  users.map(user => `${user.email},${user.username},${user.password}`).join('\n');

fs.writeFileSync('users.csv', csvContent);
console.log('users.csv has been generated');
