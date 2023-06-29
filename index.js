import fetch from 'node-fetch';
import mariadb from "mariadb";


const pool = mariadb.createPool({
     host: "127.0.0.1", 
     user: 'root', 
     password: 'nGD5!3cor7jcys',
     connectionLimit: 5,
     port: 3307
});

pool.getConnection()
    .then(conn => {

    }).catch(err => {
        console.log(err); 
    });


const fetchDataFromApi = () => {
    setInterval(() => {
        fetch("http://192.168.178.37/api/record/live").then(async response => {
            
            const data = await response.json();
            console.log(data.inverter);
        });

    }, 2000);
};