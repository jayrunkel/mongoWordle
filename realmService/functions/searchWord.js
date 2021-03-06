// This function is the endpoint's request handler.
exports = async function({ query, headers, body}, response) {
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
//    const {arg1, arg2} = query;

    // Headers, e.g. {"Content-Type": ["application/json"]}
    const contentTypes = headers["Content-Type"];

    // Raw request body (if the client sent one).
    // This is a binary object that can be accessed as a string using .text()
    const reqBody = body;

//    console.log("arg1, arg2: ", arg1, arg2);
  console.log("Content-Type:", JSON.stringify(contentTypes));


    // You can use 'context' to interact with other Realm features.
    // Accessing a value:
    // var x = context.values.get("value_name");

    // Querying a mongodb service:
    /*
     const docs = await context.services.get("mongodb-atlas").db("dictionary").collection("ospd").find({}).limit(10).toArray();
     console.log("docs: ", JSON.stringify(docs));
     const words = docs.map(doc => doc.word);
     */
     
  const bodyJson = JSON.parse(reqBody.text());
	console.log("Query body:", JSON.stringify(bodyJson));
    
  const words = context.functions.execute("queryMongoDB", bodyJson);

    // Calling a function:
    // const result = context.functions.execute("function_name", arg1, arg2);

    // The return value of the function is sent as the response back to the client
    // when the "Respond with Result" setting is set.
    return  words;
};
