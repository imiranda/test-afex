import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

const firebaseConfig = {
    apiKey: "AIzaSyAzYEU4wpV8CU65x1XkxOcXZaIIk5iqMz8",
    authDomain: "test-afex-385021.firebaseapp.com",
    projectId: "test-afex-385021",
    storageBucket: "test-afex-385021.appspot.com",
    messagingSenderId: "496985864382",
    appId: "1:496985864382:web:1290de1d72ec98742a06ef",
    measurementId: "G-9HXK58NPEB"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
    db,
};