const express=require("express")
const app=express()
var fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const { create } =require('ipfs-http-client')
const ipfs = create({ host: 'ipfs.infura.io', port: 5000, protocol: 'https' })


// const ipfsClient = require('ipfs-http-client')
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

const cors=require("cors")
// open input stream
var infs = new ffmpeg()
var multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const mkdirp = require('mkdirp')
app.use(express.json())
// app.use(express.urlencoded({ extended: true })); 
// app.use(express.urlencoded())

const defaultPlaylistName = "index.m3u8"

app.use(cors({origin:"*"}))
app.post("/postVideo",upload.single('file'),(req,res)=>{

 
    console.log(req.file);
  const name=req.file.filename
 const oldpath=req.file.path
 console.log("name",name);
 var outputDirectory = './upload/' + name;
 mkdirp(outputDirectory)
console.log("................................................................")
  ffmpeg(oldpath, { timeout: 432000 })
  .addOption('-level', 3.0)
  .addOption('-s', '640x360')
  .addOption('-start_number', 0)
  .addOption('-hls_time', 10)
  .addOption('-hls_list_size', 0)
  .format('hls')
  .on('start', function (cmd) {
    console.log('Started ' + cmd);
  })
  .on('error', function (err) {
    console.log('an error happened: ' + err.message);
  })
  .on('end', function () {
    console.log('File has been converted succesfully');
    uploadToIpfs(outputDirectory, name).then(function (err) { 
      if (!err) { 
          cleanup(outputDirectory)
          res.redirect(301, "/");
          res.end();
      }
    })
  })
  .save(outputDirectory + "/" + defaultPlaylistName)



})


function uploadToIpfs(outputDirectory, name) {
  console.log("outputDirectory",outputDirectory);
    return new Promise(function (resolve, reject) {
     uploadFiles = []
     
      var files = fs.readdirSync(outputDirectory);
      files
        .filter(file => file.substr(file.indexOf('.'), file.length) != "m3u8")
        .forEach(function (file) {
          uploadFiles.push({
            path: name + "/" + file,
            content: fs.createReadStream(outputDirectory + "/" + file)
          })
        })
  
        ipfs.addAll(uploadFiles, function (err, files) {
        if (!err) {
          console.log("uploaded to ipfs")
        } else { 
          resolve(err)
        }
        console.log("files",files)
  
        fs.readFile(outputDirectory + "/" + defaultPlaylistName, "utf8", function(err, data) {
          files.forEach(function(ipfsHash) { 
            split = ipfsHash.path.split('/')
            segment = split[split.length-1]
  
            data = data.replace(segment, "https://ipfs.io/ipfs/"+ipfsHash.hash)
          })
  
          fs.writeFile("./playlists/" + name + ".m3u8", data, "utf8", function(err) { 
            if (err) { 
              console.log("couldn't save the playlist file to playlist directory")
            } else { 
              resolve(err)
            }
          })
        });
      })
    })
  }

  function cleanup(directory) { 
    rimraf(directory, function (err) { 
      if (err) { 
        console.log("oops.. didn't cleanup correctly")
        console.log(err)
      }
    });
  }

app.listen(4000,()=>{
    console.log("ruunging at port 4k");
})