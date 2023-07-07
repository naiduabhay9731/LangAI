//import logo from './logo.svg';
import './InputOutput.css';
import React, { useState } from "react";
import axios from "axios";

function InputOutput() {
  const [inputData, setInputData] = useState('');
  const [inputTitle,setInputTitle]=useState('');
  

  const handleInputChange = (event) => {
    setInputData(event.target.value);
  };
  const handleTitleChange = (event) => {
    setInputTitle(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(inputData)

    
    try{const response = await axios.post('http://localhost:5000',{name:inputData,audtitle:inputTitle});
    console.log(response)
    // setOutputData(response.data);
    if (response.status === 200) {
      window.location.href = '/ask';
    } else {
      console.log('Request failed with status:', response.status);
    }
  
  }catch(e){
      console.log(e);
    }


    // var jsonResponse = await response;
    // setOutputData(jsonResponse.outputData);
  };

  return (
    <div className="container">
      <h1>LANGAI</h1>
      <form onSubmit={handleSubmit}>
      <div>
        
        <label>Title:</label>
        <input
          type="text"
          value={inputTitle}
          onChange={handleTitleChange} className='inut'
        />
        <label>Youtubelink:</label>
        <input
          type="text"
          value={inputData}
          onChange={handleInputChange} className='inut'
        />
      </div>
      
      <button type="submit">Submit</button>
      
      </form>
      
    </div>
  )
}

export default InputOutput;