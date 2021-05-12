var express = require('express')
var hbs = require('hbs')

var app = express()

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'hbs');

app.use(express.static(__dirname + "/views"));

var url = 'mongodb+srv://admin:admin@cluster0.pfmb3.mongodb.net';
var MongoClient = require('mongodb').MongoClient;

app.get("/", function (req, res) {
    MongoClient.connect(url, async function (error, database) {
        if (error) {
            console.log("cannot connect to database");
            return;
        }
        var dbo = await database.db("ATN");
        var col = await dbo.collection("Products");
        var data = await col.find({}).toArray();
        if(req.query.search) {      //kiểm tra xem có giá trị ?search= nhập vào hay k
            data = await col.find({name: req.query.search}).toArray(); // chuyển kết quả về dạng array
        }
        console.log(data)
        res.render("index", { Title: "Homepage", Product: data });
    });
});

app.get('/delete', async (req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;  // chuyển id từ dạng kí tự sang dang object
    let condition = { "_id": ObjectID(id) };

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATN");

    await dbo.collection("Products").deleteOne(condition);
    res.redirect('/')
})

app.get("/addproduct", function (req, res) {
    res.render("add", { Title: "add"});
});

app.post("/addproduct", function (req, res) {
    MongoClient.connect(url, async function (error, database) {
        if (error) {
            console.log("cannot connect to database");
            return;
        }
        var dbo = await database.db("ATN");
        var col = await dbo.collection("Products");
        
        var name = req.body.name;
        var price = req.body.price;
        var image = req.body.image;
        var data = { name: name, price: price, image: image };
        var message;
        console.log(data);
        if (name == "" || price == "" || image == "") {
            res.status(500).send({message:"error"})
            } else {
            await col.insertOne(data, function (error) {
                if (error) {
                    res.status(500).send({message:"error"})
                } else res.redirect("/");
            });
        }

    });
});
const PORT = process.env.PORT || 3000
app.listen(PORT);
console.log('Server is running at 3000')