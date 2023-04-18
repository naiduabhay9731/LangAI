//import logo from './logo.svg';
import './InputOutput.css';
import React, { useState } from "react";
//import axios from "axios";

function InputOutput() {
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');

  const handleInputChange = (event) => {
    setInputData(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputData })
    })
    .then((response) => response.text())
    .then()

    var jsonResponse = await response;
    setOutputData(jsonResponse.outputData);
  };

  return (
    <div className="container">
      <h1>Input/Output Example</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="input" className="label">Input:</label>
          <input type="text" id="input" value={inputData} onChange={handleInputChange} className="input" />
        </div>
        <button type="submit" className="button">Submit</button>
      </form>
      {outputData && (
        <div className="output">
          <h2 className="output-heading">Output:</h2>
          <p className="output-text">{outputData}</p>
        </div>
      )}
    </div>
  )
}

export default InputOutput;