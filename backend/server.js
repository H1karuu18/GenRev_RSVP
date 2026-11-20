import app from './src/app.js'

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Gender Reveal RSVP API listening on port ${port}`)
})
