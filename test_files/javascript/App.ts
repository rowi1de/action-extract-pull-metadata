import * as express from 'express'
import * as Vue from 'Vue'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.get('/', (req, res) => {
      res.json({
        message: 'Hello World!'
      })
    })
    this.express.use('/', router)
  }
}
Vue.something()
export default new App().express