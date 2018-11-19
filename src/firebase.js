const firebase = require ("firebase/app");
require("firebase/firestore") 
//Initialize Firebase
var config = {
  apiKey: "AIzaSyAawpA0PaI-X4yPwm04JoQKA6xRn9m-BJg",
  authDomain: "tactiled.firebaseapp.com",
  databaseURL: "https://tactiled.firebaseio.com",
  projectId: "tactiled",
  storageBucket: "tactiled.appspot.com",
  messagingSenderId: "544905223160"
};

  module.exports = firebase.initializeApp(config);