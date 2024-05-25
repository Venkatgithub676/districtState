const express = require("express");
const app = express();
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const { open } = sqlite;
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
  }
};

initializeDBAndServer();

// get states api

app.get("/states/", async (request, response) => {
  const query = `select * from state;`;
  const res = await db.all(query);
  const res1 = res.map((each) => ({
    stateId: each.state_id,
    stateName: each.state_name,
    population: each.population,
  }));
  response.send(res1);
});

// get state api
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const query = `select * from state where state_id=${stateId};`;
  const res = await db.get(query);
  const res1 = {
    stateId: res.state_id,
    stateName: res.state_name,
    population: res.population,
  };
  response.send(res1);
});

// create district api

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const query = `insert into district(district_name,state_id,cases,cured,active,deaths) values('${districtName}',${stateId},${cases},${cured},${active},${deaths})`;
  const res = await db.run(query);
  response.send("District Successfully Added");
});

// get district api

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `select * from district where district_id=${districtId};`;
  const res = await db.get(query);
  const res1 = {
    districtId: res.district_id,
    districtName: res.district_name,
    stateId: res.state_id,
    cases: res.cases,
    cured: res.cured,
    active: res.active,
    deaths: res.deaths,
  };
  response.send(res1);
});

// delete district api

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `delete from district where district_id=${districtId};`;
  const res = await db.run(query);
  console.log(res);
  response.send("District Removed");
});

// add district api

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const query = `update district set district_name='${districtName}',state_id=${stateId},
  cases=${cases},cured=${cured},active=${active},deaths=${deaths} where district_id=${districtId};`;
  const res = await db.run(query);
  console.log(res);
  response.send("District Details Updated");
});

// stats api

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const query = `select sum(cases) as totalCases, sum(cured) as totalCured,sum(active) as totalActive,
    sum(deaths) as totalDeaths from district where state_id=${stateId};`;
  const res = await db.get(query);
  response.send(res);
});

// get state name api
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const query = `select state_name as stateName from state inner join district on state.state_id = district.state_id where district_id=${districtId};`;
  const res = await db.get(query);
  response.send(res);
});

module.exports = app;
