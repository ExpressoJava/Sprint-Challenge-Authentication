const axios = require("axios")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { authenticate } = require("../auth/authenticate")
const secrets = require("../secrets/secret").jwtSecret
const db = require("../database/dbConfig.js")

module.exports = server => {
  server.post("/api/register", register)
  server.post("/api/login", login)
  server.get("/api/jokes", authenticate, getJokes)
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  }

  const options = {
    expiresIn: "45m" // m = minute(s)
  }
  return jwt.sign(payload, secrets, options)
}

async function register(req, res) {
  // implement user registration
  const creds = req.body
  hash = bcrypt.hashSync(creds.password, 10)
  creds.password = hash

  try {
    const ids = await db("users").insert(creds)
    const id = ids[0]
    const user = await db("users")
      .where({ id })
      .first()
    const token = generateToken(user)
    res.status(201).json({ token })
  } catch (err) {
    if (err.errno === 19) {
      res
        .status(409)
        .json({ message: "That username is taken, please try another!" })
    } else {
      console.log(err)
      res
        .status(500)
        .json({ message: "Something went wrong, please try again." })
    }
  }
}

function login(req, res) {
  // implement user login
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  }

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results)
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err })
    })
}
