exports = async function(regex){
  /*
    Accessing application's values:
    var x = context.values.get("value_name");

    Accessing a mongodb service:
    var collection = context.services.get("mongodb-atlas").db("dbname").collection("coll_name");
    collection.findOne({ owner_id: context.user.id }).then((doc) => {
      // do something with doc
    });

    To call other named functions:
    var result = context.functions.execute("function_name", arg1, arg2);

    Try running in the console below.
  */
  
    const docs = await context.services.get("mongodb-atlas").db("dictionary").collection("ospd").find({word: {$regex : regex}}).limit(10).toArray();
    console.log("docs: ", JSON.stringify(docs));
    const words = docs.map(doc => doc.word);
  
  return words;
};