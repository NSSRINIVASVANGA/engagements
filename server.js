const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;


const mongoURI = 'mongodb+srv://vanganataraj787:vanga2002@ex-pro.3x3dv.mongodb.net/?retryWrites=true&w=majority&appName=ex-pro';


mongoose.connect(mongoURI).then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});


app.use(cors());
app.use(express.json());


const engagementSchema = new mongoose.Schema({
    channel : String,
    engagements : Number,
    clicks : [Number]
});

const Engagement = mongoose.model('Engagement', engagementSchema);


app.get('/attributions', async (req, res) => {
    const { model } = req.query;

  try {
    const engagements = await Engagement.find({});

    const data = engagements.map((item) => {
      switch (model) {
        case "last-click":
          return { channel: item.channel, value: item.clicks[item.clicks.length - 1] };
        case "first-click":
          return { channel: item.channel, value: item.clicks[0] };
        case "linear":
          const avg = item.clicks.reduce((sum, click) => sum + click, 0) / item.clicks.length;
          return { channel: item.channel, value: avg };
        default:
          return { channel: item.channel, value: item.engagements };
      }
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});


app.post('/attribution', async (req, res) => {
    const{channel,engagements,clicks} = req.body
    try {
        const engagement = new Engagement({
            channel,
            engagements,
            clicks
        });
        
        await engagement.save();
        res.status(201).json(engagement);
    } catch (error) {
        console.error("Error adding engagement:", error);
        res.status(500).json({ error: "Failed to add engagement" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});