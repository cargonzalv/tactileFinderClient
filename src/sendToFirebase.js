const firebase = require("./firebase");
const fs = require('fs');

const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

let binary = fs.readFileSync('./tfmodel/mobilenet_1.0_224/tensorflowjs_model.pb').toString();
console.log(binary)
firestore.collection("mobilenet").doc("model").set({data: binary},function(done){
    console.log("done")
})

// let json = fs.readFileSync("./tfmodel/mobilenet_1.0_224/weights_manifest.json")
// json = json.toString();
// firestore.collection("mobilenet").doc("weights").set({
//     data: json
// })
// console.log("done")
// firestore.collection("mobilenet").doc("weights").get().then(function(doc){
//     if(doc.exists){
    //         console.log(JSON.parse(doc.data().data))
//     }
// })