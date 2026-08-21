const express = require("express");

const router = express.Router();

const Report = require("../models/Report");

router.post("/add", async (req, res) => {

  try {

    const report = new Report(req.body);

    await report.save();

    res.status(201).json(report);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

router.get("/", async (req, res) => {

  try {

    const reports = await Report.find();

    res.json(reports);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

module.exports = router;