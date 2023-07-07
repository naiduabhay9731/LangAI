const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const mongoose = require("mongoose");
const langchain = require("langchain/llms/openai");
const { PineconeClient } = require("@pinecone-database/pinecone");
const ffmpeg = require("fluent-ffmpeg");
const { VectorDBQAChain } = require("langchain/chains");
const { Document } = require("langchain/document");

const { response, text } = require("express");
const { ChromaClient } = require("chromadb");
const OpenAI = require("langchain/llms/openai").OpenAI;
const PineconeStore = require("langchain/vectorstores/pinecone").PineconeStore;
var path = require("path");
const ConversationalRetrievalQAChain =
  require("langchain/chains").ConversationalRetrievalQAChain;
const { log } = require("console");
const OpenAIEmbeddings =
  require("langchain/embeddings/openai").OpenAIEmbeddings;
const RecursiveCharacterTextSplitter =
  require("langchain/text_splitter").RecursiveCharacterTextSplitter;
const express = require("express");
const yt = require("yt-converter");
const cors = require("cors");
const { title } = require("process");
const app = express();

const client = new ChromaClient();
app.use(cors());
app.use(express.json());

var ytlink;

const naidu = process.env.OPENAI_API_KEY;
const mongoserver = process.env.mongo3
const pineconeapi = process.env.pineapi;


mongoose.connect("mongodb+srv://"+mongoserver);
//Connects backend to mongodb atlas

const transc = {
  title: String,
  text: String,
};
const User = new mongoose.model("caption", transc);
const configuration = new Configuration({
  apiKey: naidu,
});
//Creates openai configuration

var tt = {};
var dir = __dirname + "/audio2";
const directory2 = fs.opendirSync(dir);

const openai = new OpenAIApi(configuration);
async function deleteFiles(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      files.forEach((file) => {
        fs.unlink(`${directoryPath}/${file}`, (error) => {
          if (error) {
            reject(error);
            return;
          }
        });
      });

      resolve();
    });
  });
}

function deleteText(directorypath){
  fs.readdir(directorypath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Iterate over the files and delete them
    files.forEach((file) => {
      const filePath = `${directorypath}/${file}`;
      var extname2=path.extname(filePath);
      if(extname2==".txt"){
        fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted:", filePath);
        }
      });
      }
      // Delete the file
      
    });
  });
}
async function splitAudio(
  inputFilePath,
  outputFolderPath,
  durationInSeconds,
  duration,
  audtitle
) {
  const l = Math.floor(duration / durationInSeconds);
  var dirtext=__dirname;
  deleteText(dirtext);

  for (var i = 0; i < l; i++) {
    console.log(l);
    
    ffmpeg(inputFilePath)
      .setStartTime(durationInSeconds * i) // Start from the beginning
      .setDuration(durationInSeconds * (i + 1)) // Split duration in seconds
      .output(outputFolderPath + "/output" + i + ".mp3") // Output file path pattern
      .on("end", function () {
        console.log("Splitting complete!");
      })
      .on("error", function (err) {
        console.error("Error while splitting:", err);
      })
      .run();

    
  }
  ffmpeg(inputFilePath)
    .setStartTime(durationInSeconds * l) // Start from the beginning
    .setDuration(durationInSeconds) // Split duration in seconds
    .output(outputFolderPath + "/output" + l + ".mp3") // Output file path pattern
    .on("end", function () {
      console.log("Splitting complete!");
    })
    .on("error", function (err) {
      console.error("Error while splitting:", err);
    })
    .run();


  

  transcribe(audtitle);
    const ret='done';

  return ret;
  
}

app.post("/", async (req, res) => {
  // const textdelete = __dirname;
  // deleteText(textdelete);
  const inputData = req.body.name;
  const audtitle=req.body.audtitle;
  console.log(inputData,audtitle);
  

  ytlink = inputData;
  const onData = (percentage) => {
    console.log(percentage);
  };

  const onClose = async () => {
    // let file2;
    // var inputFilePath;
    // while ((file2 = directory2.readSync()) !== null) {
    //   if (path.extname(file2.name) == ".mp3") {
    //     inputFilePath = __dirname + "/audio2/" + file2.name;
    //   }
    // }
    // const outputFolderPath = __dirname + "/audio";
    // const durationInSeconds = 299;
    // var duration;
    // async function handleMetadata(err, metadata) {
    //   if (err) {
    //     console.error(`Error occurred: ${err.message}`);
    //     return;
    //   }

    //   const duration = metadata.format.duration;
      
    //   // Call splitAudio with the required parameters
    //   // const wait= await splitAudio(inputFilePath, outputFolderPath, durationInSeconds, duration,audtitle);
      
    // }
    // ffmpeg.ffprobe(inputFilePath, handleMetadata);

    res.send(await transcribe(audtitle));

    console.log("Finish");
  };

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  yt.convertAudio(
    {
      url: ytlink,
      itag: 140,
      directoryDownload: __dirname + "/audio2",
      title: "audio6.mp3",
    },
    onData,
    onClose
  );

  // const out_put =await runEmbed(inputData);
  
  
});

// This post request on submitting button gets the input query which is then used to call the runEmbed()
// function which provides output using langchain openAi and Chroma,which is then passed to the frontend and then displayed
// using react

async function transcribe(audtitle) {
  const directory = fs.opendirSync(__dirname + "/audio2");
  let file;
  var i=0;
  while ((file = directory.readSync()) !== null) {
    var audtitle1 = file.name;

    const resp = await openai.createTranscription(
      fs.createReadStream("audio2/" + audtitle1), // audio input file
      "whisper-1"
    );

    tt = resp.data;

    const newData = new User({
      title: audtitle+i,
      text: tt.text,
    });
    i++;
    User.findOne({ title: audtitle }).then((found) => {
      if (found) {
        fs.appendFile("data.txt", found.text, (err) => {
          if (err) {
            throw err;
          } else {
            console.log("File is created successfully.");
          }
        });
      } else {
        newData.save();

        fs.appendFile("data.txt", newData.text, (err) => {
          if (err) {
            throw err;
          } else {
            console.log("File is created successfully.");
          }
        });
      }
    });
  }
  
  const directorydel = __dirname + "/audio";
  // fs.readdir(directorydel, (err, files) => {
  //   if (err) {
  //     console.error("Error reading directory:", err);
  //     return;
  //   }

  //   // Iterate over the files and delete them
  //   files.forEach((file) => {
  //     const filePath = `${directorydel}/${file}`;

  //     // Delete the file
  //     fs.unlink(filePath, (err) => {
  //       if (err) {
  //         console.error("Error deleting file:", err);
  //       } else {
  //         console.log("File deleted:", filePath);
  //       }
  //     });
  //   });
  // });
    await deleteFiles(directorydel);
    
    
  
  
    const ret='done';

    return ret;
  directory.closeSync();
}

app.post("/ask", async (req, res) => {
  const ques=req.body.question;
  const answert = await runEmbed(ques);
  res.send(answert);
});
// Transcribes audio4.mp3 file into text and saves it to mongodb and to data.txt.

const runEmbed = async (ques) => {
  const directorydel2 = __dirname + "/audio2";
  
  await deleteFiles(directorydel2);
  const model = new OpenAI({
    openAIApiKey: naidu,
  });
  //Creates an OpenAI model
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: "asia-northeast1-gcp",
    apiKey: pineconeapi,
  });

  const data_text = fs.readFileSync("data.txt", "utf-8");
  //Reads file data.txt
  const textSplit = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  //Splits the data.txt text to smaller chunks.
  const doc = await textSplit.createDocuments([data_text]);

  idd = [];
  docData = [];
  docMeta = [];
  var docs = [];
  for (let i = 0; i < doc.length; i++) {
    let idno = "doc" + (i + 1).toString();
    idd.push(idno);
    docData.push(doc[i].pageContent);
    docs.push(
      new Document({
        metadata: doc[i].metadata,
        pageContent: doc[i].pageContent,
      })
    );

    docMeta.push(doc[i].metadata);
  }

  const index = pinecone.Index("langai2");
  const info = await pinecone.describeIndex({
    indexName: "langai2",
  });

  const embeddings = new OpenAIEmbeddings({ openAIApiKey: naidu });

  await PineconeStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ openAIApiKey: naidu }),
    {
      pineconeIndex: index,
    }
  );

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: naidu }),
    { pineconeIndex: index }
  );

  const question = ques;

  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 3,
    returnSourceDocuments: true,
  });
  const response = await chain.call({ query: question });
  
  return response.text;
};


// directory2.closeSync();
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log("Server running"+PORT);
});
