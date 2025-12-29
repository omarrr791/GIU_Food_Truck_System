const bcrypt = require('bcrypt'); // Import bcrypt

const password = '1234'; // Replace with your desired plaintext password

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err; // Handle errors
    console.log('Hashed Password:', hash); // Print the hashed password
});
