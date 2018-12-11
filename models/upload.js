var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  host: {type: String, trim: true, required: true},
  field: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  applicant: {type: String, trim: true, required: true},
  sdate: {type: Date, trim: true, required: true},
  ldate: {type: Date, trim: true, required: true},
  guidance: {type: String, trim: true, required: true},
  manager: {type: String, trim: true, required: true},
  phone: {type: String, trim: true, required: true},
  tags: [String],
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Question = mongoose.model('Question', schema);

module.exports = Question;
