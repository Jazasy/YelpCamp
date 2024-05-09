const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { cloudinary } = require("../cloudinary")

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map( e => {
        return {
            url: e.path,
            filename: e.filename
        }
    });
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash("success", "You successfully created a new Campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
    if (!foundCampground) {
        req.flash("error", "Cannot find that Campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground: foundCampground });
}

module.exports.renderEditForm = async (req, res) => {
    const foundCampground = await Campground.findById(req.params.id);
    if (!foundCampground) {
        req.flash("error", "Cannot find that Campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground: foundCampground });
}

module.exports.updateCampground = async (req, res) => {
    const foundCampground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    const newImages = req.files.map( e => {
        return {
            url: e.path,
            filename: e.filename
        }
    });
    foundCampground.images.push(...newImages);          //using the spread operator
    await foundCampground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await foundCampground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash("success", "You successfully updated the Campground!");
    res.redirect(`/campgrounds/${foundCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const foundCampground = await Campground.findById(req.params.id);
    for(let obj of foundCampground.images){
        await cloudinary.uploader.destroy(obj.filename);
    }
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "You successfully deleted the Campground!");
    res.redirect("/campgrounds");
}