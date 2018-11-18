import firebase from "firebase/app";
import "firebase/firestore" 
//Initialize Firebase
const config = {
    // apiKey: "AIzaSyC9TwT2vJFM22RGRlPeQJUxGVMqlIZHF0o",
    // authDomain: "areview-30ddd.firebaseapp.com",
    // databaseURL: "https://areview-30ddd.firebaseio.com",
    // projectId: "areview-30ddd",
    // storageBucket: "",
    // messagingSenderId: "99109459298"
    apiKey: "AIzaSyCPj6CaNrC4pXZeItaKmZsE-GoRlQ84VkE",
    authDomain: "areviewandroid.firebaseapp.com",
    databaseURL: "https://areviewandroid.firebaseio.com",
    projectId: "areviewandroid",
    storageBucket: "areviewandroid.appspot.com",
    messagingSenderId: "436090001198"
  };

  export default firebase.initializeApp(config);