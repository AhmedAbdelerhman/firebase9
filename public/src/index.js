console.log(window.location.hostname);
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  connectFirestoreEmulator,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCRHTdtckA8HC7zjTyAaIt1T-eXSZgXBAw",
    authDomain: "fir-9-11341.firebaseapp.com",
    projectId: "fir-9-11341",
    storageBucket: "fir-9-11341.appspot.com",
    messagingSenderId: "487896374970",
    appId: "1:487896374970:web:0edeaf7e33cb99504f2c83"
  };
//127.0.0.1:4000/
// init firebase
http: initializeApp(firebaseConfig);

// firebaseApps previously initialized using initializeApp()
const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080
);
// const auth = getAuth();
// connectAuthEmulator(auth, "http://localhost:9099");

// // collection ref

const colRef = collection(db, "books");

// get collection data
getDocs(colRef)
  .then((snapshot) => {
    console.log(snapshot);
    // console.log(snapshot.docs)
    let books = [];
    snapshot.docs.forEach((doc) => {
      books.push({ ...doc.data(), id: doc.id });
    });
    console.log(books);
  })
  .catch((err) => {
    console.log(err.message);
  });
