// import mysql from "mysql2/promise";

// const database = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "rohit79",
//     database: "wishlist",
//     connectionLimit: 10,
//     waitForConnections: true,
//     queueLimit: 0,
// });

// // // Listen for the 'connection' event
// // database.on('connection', () => {
// //     console.log('Connected to MySQL database');
// // });

// // // Listen for the 'error' event
// // database.on('error', (err) => {
// //     console.error('Error connecting to MySQL database:', err);
// // });

// // // Testing connection status
// // if (database._closed) {
// //     console.error('Error: Not connected to MySQL database');
// // } else {
// //     console.log('Connected to MySQL database');
// // }

// database.getConnection()
//   .then((connection) => {
//     console.log("✅ Connected to MySQL database");
//     connection.release();
//   })
//   .catch((err) => {
//     console.error("❌ Error connecting to MySQL database:", err);
//   });

// export default database;

// connection/database.js
// import mysql from "mysql2/promise";

// let database;

// try {
//   database = mysql.createPool({
//     host: "localhost",        // 🔧 your DB host
//     user: "root",             // 🔧 your DB user
//     password: "rohit79",      // 🔧 your DB password
//     database: "wishlist",     // 🔧 your DB name
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//   });

//   console.log("✅ MySQL2 Promise connection established successfully");
// } catch (err) {
//   console.error("❌ Error connecting to MySQL:", err);
//   process.exit(1);
// }

// export default database;

import mysql from "mysql2/promise";
 
const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "rohit79",
    database: "wishlist",
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    connectTimeout: 10000
});
 
// Test connection
(async () => {
    try {
        const connection = await database.getConnection();
        console.log("Connected to MySQL database (promise pool)");
        connection.release();
    } catch (err) {
        console.error("Error connecting to MySQL database:", err);
    }
})();
 
export default database;