import express, { Application } from 'express'
import cors from 'cors'
import usersRouter from './app/modules/users/users.route'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
const app: Application = express()

app.use(cors())

// parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// application routes
app.use('/api/v1/users', usersRouter)

// Testing
// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//   // res.send('Working Successfully!')
//   throw new Error('Ore baba error')
//   // throw new ApiError(400, 'Ore baba error')
//   // next('Ore Baba Error') // Error
// })

// Global error handler
app.use(globalErrorHandler)

export default app
