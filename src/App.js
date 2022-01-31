import ipfs from "./ipfs"
import React,{useState} from 'react';
var Buffer = require('buffer/').Buffer
function App() {
  const [file,setFile]=useState(null)
  const [ipfsHash,setIpfshash]=useState("")
  const changeFile=(e)=>{
  setFile(e.target.files[0])

  const ifile = e.target.files[0]
  const reader = new window.FileReader()
  reader.readAsArrayBuffer(ifile)
  reader.onloadend = () => {
    setFile(Buffer(reader.result))
    console.log('buffer')
  }
  }

  const fileSubmit=async()=>{
   console.log(file);
    const result=await ipfs.add(file)
    console.log(result);
    console.log("ipfsHash",result.path);
    setIpfshash(result.path)

  }
  return (
    <div className="App">
      <h1>hello</h1>
       <img src={`https://ipfs.io/ipfs/${ipfsHash}`} alt="" />
      <input type="file" onChange={changeFile}/>
      <button onClick={fileSubmit}>click</button>
    </div>
  );
}

export default App;
