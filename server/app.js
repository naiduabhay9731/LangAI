const { Configuration, OpenAIApi } = require("openai");
const fs=require("fs");
const mongoose = require("mongoose");
const langchain = require('langchain/llms/openai');

const { response, text } = require("express");
const {ChromaClient} = require('chromadb');
const OpenAI = require("langchain/llms/openai").OpenAI;
const Chroma =require("langchain/vectorstores/chroma").Chroma;

const ConversationalRetrievalQAChain= require("langchain/chains").ConversationalRetrievalQAChain;
const { log } = require("console");
const OpenAIEmbeddings= require( "langchain/embeddings/openai").OpenAIEmbeddings;
const RecursiveCharacterTextSplitter= require( "langchain/text_splitter").RecursiveCharacterTextSplitter;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const client = new ChromaClient();

app.use(express.json())

const onData = (percentage) =>{
    console.log(percentage)
}
const onClose = () =>{
    console.log("Finish")
}



mongoose.connect('mongodb+srv://naiduabhay1:naiduabhay1107@diarycluster.ic3uetd.mongodb.net/transcribe');
//Connects backend to mongodb atlas 

const transc = {
    title: String,
    text: String
};
const User = new mongoose.model('caption', transc)
const configuration = new Configuration({
  apiKey: "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",
});
//Creates openai configuration




var tt={};
var audtitle= "audio4";
const openai = new OpenAIApi(configuration);



app.post("/",async (req,res)=>{
    
    const inputData = req.body.inputName;
    const out_put =await runEmbed(inputData);
    res.send(out_put.text);

})

// This post request on submitting button gets the input query which is then used to call the runEmbed()
// function which provides output using langchain openAi and Chroma,which is then passed to the frontend and then displayed
// using react







async function transcribe() {
    
    const resp = await openai.createTranscription(
        fs.createReadStream(audtitle+".mp3"), // audio input file
        "whisper-1");
    
    
    tt=resp.data;
   
    
    
    const newData= new User({
        title:audtitle,
        text:tt.text
        
    });

    
    User.findOne({title:audtitle}).then(found=>{
        if (found) {
            console.log("done");
            fs.writeFile('data.txt',found.text,(err)=>{
                if(err){
                    throw err;
                }
                else{
                    console.log('File is created successfully.');
                }
            } )

        }
        else {
            newData.save();
            console.log("added");
            fs.writeFile('data.txt',found.text,(err)=>{
                if(err){
                    throw err;
                }
                else{
                    console.log('File is created successfully.');
                }
            } )
        }
    })
}
// Transcribes audio4.mp3 file into text and saves it to mongodb and to data.txt.
transcribe();

 const runEmbed =async (ques)=>{
    const model= new OpenAI({
        openAIApiKey:"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",
    });
    //Creates an OpenAI model
    
    const data_text= fs.readFileSync("data.txt",'utf-8');
    //Reads file data.txt
    const textSplit =new RecursiveCharacterTextSplitter({chunkSize:1000});
    //Splits the data.txt text to smaller chunks.
    const doc = await textSplit.createDocuments([data_text]);


    id=[];
    docData=[];
    docMeta=[]
    
    for(let i=0;i<doc.length;i++){
        let idno="doc"+(i+1).toString();
        id.push(idno);
        docData.push(doc[i].pageContent);
        docMeta.push(doc[i].metadata);
        
    }
    const vectorStore = await Chroma.fromDocuments(
        doc,
        new OpenAIEmbeddings({openAIApiKey:"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"}),
        { collectionName: "transcribe" }
    );//Creates Vector store from Chroma 

    const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever()
      );
      //Uses Vector Store to create a chain using LLM which is used to Retrieve similar documents

    const question = ques;
    
    
    
    
    
    const res = await chain.call({ question, chat_history: [] });

    //Uses Chain and OpenAI model to get the response which is then returned from the function.
    
  
    
    

    
    

    
    return  res;
   


}



const port =3000;
const outrrr="start on   "+port
app.listen(port, function () {
    console.log(outrrr);
})