const express = require('express');
const Question = require('../models/upload');
const User = require('../models/user'); 
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');  //현재 디렉토리의 lib라는 파일의 async-error

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}

/* GET questions listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const questions = await Question.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('upload/index', {questions: questions, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('upload/new', {question: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  res.render('upload/edit', {question: question});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate('author');   //await가 붙었으니 찾을때까지 기다림
  const answers = await Answer.find({question: question.id}).populate('author'); // await가 붙었으니 찾을때까지 기다림
  question.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  await question.save(); //await가 붙었으니 찾을때까지 기다림
  res.render('upload/show', {question: question, answers: answers}); //다 성공하면 여기에 들어옴 question: (?모르겠음) answers: 공모전 이라 생각하기
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.host = req.body.host;
  question.field = req.body.field;
  question.content = req.body.content;
  question.applicant = req.body.applicant;
  question.sdate = req.body.sdate;
  question.ldate = req.body.ldate;
  question.guidance = req.body.guidance;
  question.manager = req.body.manager;
  question.phone = req.body.phone;
  question.tags = req.body.tags.split(" ").map(e => e.trim());

  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/upload');
}));


router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/upload');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var question = new Question({
    title: req.body.title,
    author: user._id,
    host: req.body.host,
    field: req.body.field,
    content: req.body.content,
    applicant: req.body.applicant,
    sdate: req.body.sdate,
    ldate: req.body.ldate,
    guidance: req.body.guidance,
    manager: req.body.manager,
    phone: req.body.phone,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/upload');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist competition');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await answer.save();
  question.numAnswers++;
  await question.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/upload/${req.params.id}`);
}));



module.exports = router;