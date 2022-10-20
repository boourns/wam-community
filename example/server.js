import express from 'express'

import {Plugins, Categories} from '../dist/index.js';

const app = express()
const port = 3500

app.get('/', (req, res) => {
const body = `
The following plugins are available:
${Plugins.map(p => `<a href="/plugins/${p.path}/index.js">${p.name}</a>`).join("<br />")}
`
    res.status(200).send(body)
})

app.use("/plugins", express.static('../dist/plugins'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})