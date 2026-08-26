/* @license Apache-2.0; ver LICENCIA.txt */

import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const conect = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

export default conect
