const firebase = require("./firebase");
const fs = require('fs');

const storage = firebase.storage().ref();

const exampleRef = storage.child("test.json")

let json = fs.readFileSync("./tfmodel/mobilenet_1.0_224/weights_manifest.json")

exampleRef.put(json).then(()=>{
    console.log("done")
})