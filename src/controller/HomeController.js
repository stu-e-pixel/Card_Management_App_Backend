class HomeController{
    home(req,res){
        res.render("home",{
            title:"This is a home page"
        })
    }

}

module.exports= new HomeController()