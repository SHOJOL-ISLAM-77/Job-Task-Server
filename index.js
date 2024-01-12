const express = require("express");
const app = express();
const multer = require("multer");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 7000;

// middleware
app.use(
    cors({
      origin: [
        "http://localhost:5173",
        // "https://job-task77.web.app",
      ],
      credentials: true
    })
  );
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u6ptml9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const JobTaskCollections = client.db("JobTaskDB").collection("TaskApis");
    const JobTaskCollection = client.db("JobTaskDB").collection("TaskApi");

    app.post("/upload-files", upload.array("files"), async (req, res) => {
      const files = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
      }));

      const result = await JobTaskCollections.insertMany(files);
      res.send(result);
    });

    app.put("/update-attachment/:id", async (req, res) => {
      const string = req.params.id;
      const id = parseInt(string);
      console.log(parseInt(string));
      const data = req.body;
      const filter = {
        id: id,
      };
      const options = { upsert: true };
      const updateAttachmentsCount = {
        $inc: {
          attachments_count: data.data || 0,
        },
      };
      const result = await JobTaskCollection.updateOne(
        filter,
        updateAttachmentsCount,
        options
      );

      res.send(result);
    });

    app.get("/get-jobTask", async (req, res) => {
      const result = await JobTaskCollection.find().toArray();
      res.json(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Job task Server..");
});

app.listen(port, () => {
  console.log(`Job task is running on port ${port}`);
});
