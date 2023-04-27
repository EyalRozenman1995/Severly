
//Imports
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const mysql = require('mysql');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

//Data base connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'serversDevForce',
});
db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to DB");
});
module.exports = { db };

//Creating tables
const createTableQuery1 = `
    CREATE TABLE serverTypes (
      typeName varchar(45) NOT NULL,
      pricePerMinute int NOT NULL,
      PRIMARY KEY (typeName)
    )
`;

const createTableQuery2 = `
    CREATE TABLE servers (
      ipAddress varchar(15) NOT NULL,
      serverName varchar(45) NOT NULL,
      serverType varchar(45) NOT NULL,
      runningMode BOOLEAN NOT NULL,
      runningTime int NOT NULL,
      lastTime int NOT NULL,
      PRIMARY KEY (ipAddress),
      KEY serverType_idx (serverType),
      CONSTRAINT serverType FOREIGN KEY (serverType) REFERENCES serverTypes (typeName)
    )
`;

const insertServersType = `
  INSERT INTO serverTypes (typeName, pricePerMinute) 
  VALUES ('Basic', 5), ('Deluxe', 10), ('Premium', 15);`;

db.query(createTableQuery1, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Server types table created successfully');
});

db.query(createTableQuery2, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Servers table created successfully');
});

db.query(insertServersType, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Server types inserted successfully');
});

//Server start
app.listen(3306, () => {
  console.log("Listen on server 3306");
});

//Delete a server
app.delete("/api/delete", (req, res) => {
  const ipAddress = req.body.ipAddress;
  const sqlDelete = `DELETE FROM servers 
    WHERE ipAddress = '${ipAddress}'`;
  db.query(sqlDelete, (err: any, result: any) => {
    if (err) {
      console.log("Failed to delete server");
      console.error(err);
      return;
    }
    console.log(`Server deleted successfully`);
  })
});

//Create a server
app.post("/api/create", (req, res) => {
  const ipAddress = req.body.ipAddress;
  const serverName = req.body.serverName;
  const serverTypeName = req.body.serverTypeName;
  const lastTime = getTime();
  const sqlInsert = `INSERT INTO servers
    (ipAddress,
      serverName,
      serverType,
      runningMode,
      runningTime,
      lastTime)
   VALUES ('${ipAddress}',
   '${serverName}',
   '${serverTypeName}',
   true,
   0,
   '${lastTime}')`;
  db.query(sqlInsert, (err: any, result: any) => {
    if (err) {
      console.log("Failed to create server");
      console.error(err);
      return;
    }
    console.log("Server created successfully");
  });
})

//Get all servers
app.get("/api/servers", (req, res) => {
  const sqlGet = `SELECT * FROM servers`;
  db.query(sqlGet, (err: any, result: any) => {
    if (err) {
      console.log("Failed to read server");
      console.error(err);
      return;
    }
    if (result.length === 0) {
      console.error("No servers found");
      return;
    }
    result.forEach((server: any) => {
      if (server.runningMode)
        updateRunningTime(server.ipAddress);
    });
    console.log("Found all servers successfully");
    res.send(result)
  });
})

//Get all serversType 
app.get('/api/serverTypes', (req, res) => {
  const sqlGet = `SELECT * FROM serverTypes`;
  db.query(sqlGet, (err: any, result: any) => {
    if (err) {
      console.log("failed to read serverTypes");
      console.error(err);
      return;
    }
    if (result.length === 0) {
      console.error("No servers found");
      return;
    }
    console.log("Found all serversType successfully");
    res.send(result)
  });})

//Change server's running mode
app.put("/api/changeMode", (req, res) => {
  const ipAddress = req.body.ipAddress;
  const newMode = !(req.body.runningMode);
  if (newMode){
    run(ipAddress);
  } else {
    updateRunningTime(ipAddress);
  }
  const sqlchangeMode = `UPDATE servers
    SET runningMode = ${newMode}
    WHERE ipAddress = '${ipAddress}'`;
  db.query(sqlchangeMode, (err: any, result: any) => {
    if (err) {
      console.log("failed to change server mode");
      console.error(err);
      return;
      }
      console.log("Server's mode changed successfully");
  })
});

//Get time by minutes
function getTime() {
  const now = new Date();
  return now.getHours()*60+now.getMinutes();
}

function run(ipAddress){
  const currTime = getTime();
  const sqlTimer = `UPDATE servers
    SET lastTime = '${currTime}'
    WHERE ipAddress = '${ipAddress}'`;
  db.query(sqlTimer, (err: any, result: any) => {
    if (err) {
      console.log("Failed to update server's lastTime");
      return;
    }
    console.log("Server's lastTime updated successfully");
  });
}

function updateRunningTime(ipAddress){
  const currTime = getTime();
  const sqlTimer = `SELECT lastTime, runningTime
    FROM servers WHERE ipAddress = '${ipAddress}'`;
  db.query(sqlTimer, (err: any, result: any) => {
    if (err) {
      console.log(err);
      console.log("Failed to retrieve server's data");
      return;
    }
    const lastTime = result[0].lastTime;
    const runningTime = result[0].runningTime+(currTime-lastTime);
    console.log(runningTime);
    const sqlUpdate = `UPDATE servers
      SET runningTime = '${runningTime}', lastTime = '${currTime}'
      WHERE ipAddress = '${ipAddress}'`;
    db.query(sqlUpdate, (err: any, result: any) => {
      if (err) {
        console.log("Failed to update server's data");
        return;
      }
      console.log("Server's data updated successfully");
    });
  });
}