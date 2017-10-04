const MongoModel = require('./common/MongoModel');
const MongoDatabase = require('./common/MongoDatabase');
const Association = require('./common/Association');
const logger = require('winston');
const mongodb = require('mongodb');

const db = new MongoDatabase(encodeURI(`mongodb://${process.env['MONGO_USER']}:${process.env['MONGO_PASSWORD']}@${process.env['MONGO_HOST']}/koa2_react`));
const collectionName = 'comments';

class Comment extends MongoModel {
  constructor(data){
    super(Comment.DB, Comment.COLLECTION, data);
    //intiate fields that must exist before any other logic happens
    this.user = new Association([]);
    for (let [key, value] of Object.entries(data)) {
        switch(key){
          //special procesing for some keys
          case 'user':
            this.user = new Association(User, value);
            break;
        }
    }
    super.deserialize(data); //use parent's logic to set other attributes
  }

  static get DB(){
    return db;
  }

  static get COLLECTION(){
    return collectionName;
  }

  static async count(query){
    return await MongoModel.count(query, Comment.DB, Comment.COLLECTION);
  }

  static async where(query){  
    const results = await MongoModel.where(query, Comment.DB, Comment.COLLECTION);
    return results.map(data=>new Comment(data));
  }

  static async find(query){
    let results = await MongoModel.find(query, Comment.DB, Comment.COLLECTION);
    if(!results) return null;
    return new Comment(results);
  }

  static async delete(query){
    return await MongoModel.delete(query, Comment.DB, Comment.COLLECTION);
  }

  static async update(query, data){
    return await MongoModel.update(query, data, Comment.DB, Comment.COLLECTION);
  }

  static async insert(data){
    const results = await MongoModel.insert(query, data, Comment.DB, Comment.COLLECTION);
    return results.map(data => new Comment(data));
  }

  serialize(withId){    
    const data = super.serialize();    
    try {
      JSON.stringify(data);
      return data;
    } catch(e) {
      logger.error(`Serialization error for an instance of User: ${e.message}`);      
      throw new Error('Model serialization error, see above message for details.');
    }    
  }

  async save(asNew){
    let newRecord = await super.save(asNew);
  }

  async delete(){
    let deleted = await super.delete();
    //do something else, some kind of cleanup
    return deleted;
  }
}

exports.model = Comment;