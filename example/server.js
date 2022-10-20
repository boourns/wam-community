import express from 'express'
import {Plugins, Categories} from '../dist/index.js';

const app = express()
const port = 3500

app.get('/', (req, res) => {
    res.send("The following plugins are available: ", Plugins.map(p => p.name))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})