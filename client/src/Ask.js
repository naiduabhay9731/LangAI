
import React, { useState } from 'react';
import "./Ask.css";
import axios from 'axios';

const QuestionAnswer = () => {
    const [inputQues, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [outputData, setOutputData] = useState('');
    const [loading,setLoading]=useState(false);
  
    const handleQuestionChange = (e) => {
      setQuestion(e.target.value);
    };
  
    const handleAnswerSubmit =async (e) => {
      e.preventDefault();
      setLoading(true);
    
    console.log(inputQues)

    
    try{const response = await axios.post('http://localhost:5000/ask',{question:inputQues});
    console.log(response)
    setOutputData(response.data);
    setLoading(false);
    // if (response.status === 200) {
    //   window.location.href = '/ask';
    // } else {
    //   console.log('Request failed with status:', response.status);
    // }
  
  }catch(e){
      console.log(e);
    }


    // var jsonResponse = await response;
    // setOutputData(jsonResponse.outputData);
  };

      
    
  
    return (
      <div className='AskContainer'>
        <form onSubmit={handleAnswerSubmit}>
          <input type="text" value={inputQues} onChange={handleQuestionChange} />
          <button type="submit">Submit</button>
        </form>
        {loading?(
        <p>Loading...</p>
      ):outputData?(
        (
        <div className="output">
          <h2 className="output-heading">Answer</h2>
          <p className="output-text">{outputData}</p>
        </div>
      )
      ):null}
       
      </div>
    );
        };

  

const Ask = () => {
  return (
    <div>
      <h1>Ask Page</h1>
      <QuestionAnswer />
    </div>
  );
};

export default Ask;