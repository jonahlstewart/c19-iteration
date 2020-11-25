const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    'postgres://oebljrrf:s6TaaMbtHrgeJ8sWqHmpkdd1kJjbg2N5@suleiman.db.elephantsql.com:5432/oebljrrf',
});

const db = {
  async query(text, params, callback) {
    console.log('executed query', text);
    const data = await pool.query(text, params, callback);
    return data;
  },
};
//---------------------------------------------------------------------

const sqlController = {};

sqlController.insertUser = async (req, res, next) => {
  console.log('inside insertUser!');
  const pwd = res.locals.encryptedPwd;
  const { username, email, first_name, last_name } = req.body;

  // check if the user currently exists
  // if so, redirect to signup
  //  const findUserString = `SELECT * FROM users WHERE username = ${username}`
  //  const user = await db.query(findUserString)
  //  if (user) return res.redirect('/signup')

  // constructs db query for creating a new user
  const insertUserString = `INSERT INTO users(_id, username, password, email, first_name, last_name) Values(default, '${username}', '${pwd}', '${email}', '${first_name}', '${last_name}')`;

  //creates new user in the database
  db.query(insertUserString).catch(() => res.redirect('/register'));
};

// sqlController.findUser = (req, res, next) => {
//   const { username, password } = req.body;

//   const findUserString = `SELECT username, password FROM users WHERE username = ${username}`;

//   const user = db.query(findUserString);
//   if (bcrypt.compare(password, user.password)) {
//     return next();
//   }
//   return res.redirect('/logIn');

//   // res.locals.user = user;
// };

sqlController.deleteUser = (req, res, next) => {
  const { username } = req.body;

  const deleteUserString = `DELETE FROM users WHERE username = '${username}'`;

  db.query(deleteUserString);

  return next();
};

sqlController.logAssessment = (req, res, next) => {
  if (!req.user) return next();
  // remember to acct for: location, positive rates, user_id
  const { activities, zipcode } = req.body;
  const { _id } = req.user;
  const today = new Date().toLocaleDateString();
  // [mail, groceries] >> 'mail, groceries' >> true, true

  const activitesString = activities.join(', ');
  const activitiesValues = activities.map((activity) => true).join(', ');

  // create a session
  const createSessionString = `INSERT INTO assessments(_id, ${activitesString}, date, zipcode, user_id) values(default, ${activitiesValues}, ${today}, ${zipcode}, ${_id})`; // remember to change pos_rate and loc_id

  db.query(createSessionString);
  return next();
};

sqlController.findAllAssements = (req, res, next) => {
  //get profile from database using the username
  // const { username } = req.params;
  const { _id } = req.user; // unsure if this data will actually be in req.body

  const findAllString = `SELECT * FROM assessments WHERE user_id = ${_id}`;

  const assessments = db.query(findAllString);

  res.locals.assessments = assessments.rows[0];

  return next();
};

// middleware below is used to find the assessment of a guest user (meaning they are not signed in)
// does the guest assessment data even need to be in the database?
// or can we display the data we receive from their assessment directly after they click submit? (use prev functionality?)
// sqlController.findOneAssessment = (req, res, next) => {
//   const user_id = req.body // unsure if this data will actually be in req.body

//   const findOneString = `SELECT * FROM assessments WHERE user_id = guest ORDER BY date DESC LIMIT 1`

//   const assessment = db.query(findOneString)

//   res.locals.assessment = assessment

//   return next();
// }

// no need to record user location. user will input zipcode on assessment page
// sqlController.recordUserLocation = (req, res, next) => {

//     return next();
// }

// not needed bc the user can view the positive rate on the covid map
// sqlController.getPositiveRate = (req, res, next) => {

//     return next();
// }

module.exports = sqlController;
