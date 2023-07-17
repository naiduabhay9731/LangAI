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

    
    try{const response = await axios.post('https://langai.onrender.com',{name:inputData,audtitle:inputTitle});
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
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={inputTitle}
            onChange={handleTitleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="youtube-link">YouTube Link:</label>
          <input
            type="text"
            id="youtube-link"
            value={inputData}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default InputOutput;