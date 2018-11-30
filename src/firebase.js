var admin = require('firebase/app');
require("firebase/firestore")

var serviceAccount = require("./serviceAccountKey.json");

module.exports = admin.initializeApp(serviceAccount);