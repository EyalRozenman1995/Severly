//Imports
import React, {useEffect, useState} from 'react';
import './App.css';
import Axios from 'axios'

function App() {
  const [currency, setCurrency] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [ipAddress, setIpAddress] = useState('');
  const [serverName, setServerName] = useState('');
  const [serverTypeName, setServerTypeName] = useState('Basic');
  const [serversList, setServersList] = useState([]);
  const [serverTypesList, setServerTypesList] = useState([]);

  //Get serverTypes
  useEffect(() => {
    Axios.get("http://localhost:3306/api/serverTypes")
    .then((serverTypesList) => {
      setServerTypesList(serverTypesList.data);
    })
    .catch((error) => console.log(error.message));
  }, [])  

  useEffect(() => {
    Axios.get("http://localhost:3306/api/servers")
    .then((servers) => {setServersList(servers.data);})
    .catch((error) => console.log(error.message));
  }, [])  

  const createServer = () => {
    //Check if server exists
    if (serversList.find(server => server.ipAddress === ipAddress)) {
      alert("IP address already exists");
      return;
    }
        
    //Check if ip is valid
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipAddress)) {
      alert('Invalid IP address');
      return;
    }

    //Create a new server
    Axios.post("http://localhost:3306/api/create",
    { ipAddress: ipAddress,
      serverName: serverName,
      serverTypeName: serverTypeName
    })
    const currTime = new Date();
    const newServer = {
        ipAddress: ipAddress,
        serverName: serverName,
        runningTime: 0,
        serverType: serverTypeName,
        runningMode: true,
        lastTime: currTime.getHours()*60+currTime.getMinutes()
      };
    setServersList([...serversList, newServer]);
  }

  //Delete server
  const deleteServer = (ipAddress) => {
    Axios.delete("http://localhost:3306/api/delete",
        {data:{ipAddress: ipAddress}});
    const newServersList = serversList.filter(server => server.ipAddress !== ipAddress);
    setServersList(newServersList);
  }
  
  //Get currency symbol
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'EUR':
        return '€';
      case 'ILS':
        return '₪';
      default:
        return '$';
    }
  }
  
  //Get currency rate in relative to USD
  const getExchangeRate = async (currency) => {
    if (currency === 'USD'){
      setExchangeRate(1);
      return;
    }
    await Axios.get(`https://exchange-rates.abstractapi.com/v1/live?api_key=500092a22b2144038a0d8b0559bed0bb&base=USD`)
      .then((response) => {
        const currRate = response.data.exchange_rates[currency]
        setExchangeRate(currRate);
      })
      .catch((error) => {console.log(error.message);
      });
  }
  
  //Get server's price by running time and price per minute
  const getPrice = (runningTime, typeName) => {
  const serverType = serverTypesList.find(({ typeName: name }) => name === typeName);
  const pricePerMinute = serverType.pricePerMinute;
  const price = runningTime * pricePerMinute;
  return parseFloat((price * exchangeRate).toFixed(2));
}

  //Change server's running mode
  const changeMode = (ipAddress, runningMode) => {
    Axios.put("http://localhost:3306/api/changeMode",
    {ipAddress: ipAddress, runningMode: runningMode});
    const updatedServersList = serversList.map(server => {
    if (server.ipAddress === ipAddress) {
        return {
        ...server,
        runningMode: !server.runningMode
        }
    }
    return server;
    });
    setServersList(updatedServersList);
  }

  //Create the GUI
  return (
    <div className="App">
      <h1>Severly</h1>
      <h2>a web app where you can manage your servers</h2>
      <div className='createServer'>
        <label>IP address </label>
        <input type='text' name='ipAddress' value={ipAddress}
          onChange={(e) => {setIpAddress(e.target.value);}}/>
        <label>Servers name </label>
        <input type='text' name='serverName' value={serverName}
          onChange={(e) => {setServerName(e.target.value);}}/>
        <div className='selectServer'>
          <label>Server Type:</label>
          <select value={serverTypeName} onChange={(e) => {
              setServerTypeName(e.target.value);
          }} defaultValue={serverTypesList[0]}>
            {serverTypesList?.map((type) => (
              <option value={type.typeName}>
                {type.typeName} ({type.pricePerMinute}$)
              </option>
            ))}
          </select>
        </div>
        <button onClick = {createServer}>Create Server</button>
      </div>
      <div>
      <table className='serversTable'>
        <thead className='serversTableHead'>
          <tr>
            <th>IP Address</th>
            <th>Name</th>
            <th>Running Time (min)</th>
            <th>Toggle</th>
            <th>Type</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody className='serversTableBody'>
          {serversList?.map((server) => {
            return (
              <tr key={server.ipAddress}>
                <td>{server.ipAddress}</td>
                <td>{server.serverName}</td>
                <td>{server.runningTime}</td>
                <td>{server.runningMode ?
                (<button onClick={() =>
                  {changeMode(server.ipAddress, server.runningMode)}}>Stop</button>) :
                (<button onClick={() =>
                  {changeMode(server.ipAddress, server.runningMode)}}>Run</button>)}
                </td>
                <td>{server.serverType}</td>
                <td>{`${getPrice(server.runningTime, server.serverType)}
                  ${getCurrencySymbol()}`}</td>
                <td><button onClick={() =>
                    {deleteServer(server.ipAddress)}}>Delete</button></td>
              </tr>
          )})}
        </tbody>
      </table>
      <div className='currency'>
        <label>Currency:</label>
          <select onChange={(e) => {
            if (e.target.value !== currency){
              setCurrency(e.target.value);
              getExchangeRate(e.target.value);
            }
            }}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="ILS">ILS</option>
          </select>
      </div>
    </div>
    </div>
  );
}

export default App;