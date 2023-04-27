// const mysql = require('mysql');

// export class ServerType {
//   name: string;
//   pricePerMinute: number;

//   constructor(name: string, pricePerMinute: number) {
//     this.name = name;
//     this.pricePerMinute = pricePerMinute;
//   }
// }
  
// export class Server {
//   ipAddress: string;
//   name: string;
//   serverType: ServerType;
//   isRunning: number;
//   runningTime: number; //1 is running
//   private timerId: NodeJS.Timer | null;

//   constructor(ipAddress: string, name: string, serverType: ServerType, isRunning: number) {
//     this.ipAddress = ipAddress;
//     this.name = name;
//     this.serverType = serverType;
//     this.isRunning = isRunning;
//     this.runningTime = 0;
//     this.timerId = null;
//   }

//   static create(ipAddress: string, name: string, serverType: ServerType, isRunning: number, db: any) {
//     const sql = "SELECT * FROM servers WHERE IP = ?";
//     const result = db.query(sql, [ipAddress]);
//     if (result != null) {
//       console.log(`Server is already exist - change IP address ${ipAddress}`);
//       return;
//     }
//     const sqlInsert = `INSERT INTO servers (IP, name, serverType, runningMode, runningTime) VALUES ('${ipAddress}', '${name}', "testTestTest", ${isRunning ? 1 : 0}, 0)`;
//     db.query(sqlInsert, (err: any, result: any) => {
//         if (err) {
//           console.log("failed to create server");
//           console.error(err);
//           return;
//         }
//     });}

//   static read(db: any, callback: (serversList: Server[]) => void) {
//     const sqlSelect = `SELECT * FROM servers`;
//     db.query(sqlSelect, (err: any, result: any) => {
//       if (err) {
//         console.log("failed to read server");
//         console.error(err);
//         return;
//       }
//       if (result.length === 0) {
//         console.error(`No servers found`);
//         return;
//       }
//       const serversList = result.map((row: any) => {
//         return new Server(row.IP, row.name, new ServerType(row.serverType, row.runningTime), row.runningMode);
//       });
//       callback(serversList);
//     });
// }

//   // delete(db: any) {
//   //   const sqlDelete = `DELETE FROM servers WHERE IP = '${this.ipAddress}'`;
//   //   db.query(sqlDelete, (err: any, result: any) => {
//   //     if (err) {
//   //       console.log("failed to delete server");
//   //       console.error(err);
//   //       return;
//   //     }
//   //     console.log(`Server with IP address ${this.ipAddress} deleted successfully`);
//   //   })};

//   private startTimer(db: any) {
//     this.timerId = setInterval(() => {
//       const sqlUpdate = `UPDATE servers SET running time = ${this.runningTime+1} WHERE IP = '${this.ipAddress}'`;
//       db.query(sqlUpdate, (err: any, result: any) => {
//         if (err) {
//           console.log("failed to update running time");
//           console.error(err);
//         }
//       });
//     }, 60000);
//   }

//   changeState(db: any) {
//       if (this.isRunning === 0) {
//           this.startTimer(db);
//       }
//       const sqlUpdate = `UPDATE servers SET running mode = ${this.isRunning === 1 ? 0 : 1} WHERE IP = '${this.ipAddress}'`;
//       db.query(sqlUpdate, (err: any, result: any) => {
//         if (err) {
//           console.log("failed to change state");
//           console.error(err);
//         }
//       });
//   }

//    changeState() {
//       console.log("failed to change state");
//   }
  
//   }
