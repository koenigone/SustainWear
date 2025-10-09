const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// serve build files for deployment
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientDist, 'index.html'));
});

// routes will be added here
//
//

// port section
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});