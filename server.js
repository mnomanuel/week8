const express = require("express");
const cors = require("cors");
const connection = require("./database/dBconnection");
const Team = require("./model/fifa");

const app = express();

// Middleware
app.use(express.json());

app.use(cors({ origin: "http://localhost:3001" })); // Update to match your frontend URL
connection();



app.get("/api/team", async (req, res) => {
    try {
      const team = await Team.find({});
      
      res.status(201).json(team); 
    } catch (err) {
      res.status(400).json({ message: err.message});
    }
  });



  //to add data to the server(in this case sending the data from the form in the browser to the mongodb.)
  app.post("/api/team", async (req, res) => {
    try {
      const newTeam = new Team(req.body);
      const savedTeam = await newTeam.save();
      res.status(201).json(savedTeam);
    } catch (error) {
      res.status(400).json({ message: err.message });
    }
  });

  //to update the record.
  app.put("/api/team/:teamName", async (req, res) => {
    const { teamName } = req.params;
    const updatedData = req.body;
  
    try {
      const team = await Team.findOneAndUpdate({ team: teamName }, updatedData, {
        new: true,
        runValidators: true,
      });
  
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      res.status(200).json(team);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


  //team stats
  app.get("/api/team/:teamName", async (req, res) => {
    const { teamName } = req.params;
  
    try {
      const team = await Team.findOne({ team: teamName });
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });





  //deleteTeam

  app.delete("/api/team/:teamName", async (req, res) => {
    const { teamName } = req.params;
  
    try {
      const team = await Team.findOneAndDelete({ team: teamName });
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.status(200).json({ message: `Team "${teamName}" deleted successfully.` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
  


  //A component that to create userinterface to display first 10 drecords from the records for Task mentioned in 1.9.

  app.get("/api/teams/wins", async (req, res) => {
    const { winCount } = req.query;
  
    try {
      const teams = await Team.find({ win: { $gt: Number(winCount) } })
        .limit(10)
        .sort({ win: -1 }); // Sort by wins in descending order
  
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  //An endpoint that calculates and retrieves all teams where the average "Goals For" for a given year matches the user input



  app.get("/api/teams/average-goals", async (req, res) => {
    const { year } = req.query;
  
    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }
  
    try {
      const teams = await Team.aggregate([
        { $match: { year } }, // Filter by the given year
        {
          $group: {
            _id: "$year",
            avgGoalsFor: { $avg: "$goalsFor" },
            teams: { $push: "$$ROOT" },
          },
        },
      ]);
  
      if (teams.length === 0) {
        return res.status(404).json({ message: "No teams found for the given year." });
      }
  
      res.status(200).json(teams[0]); // Return the first (and only) result
    } catch (error) {
      res.status(500).json({ message: "Error fetching data", error: error.message });
    }
  });
    



  app.listen(3000, ()=> console.log('server is running'));
  


