const Product = require('../models/Product');

const subMap = {
  "Saree": ["Dyed Fancy Matching Saree","Cotton Sarees","Rapier Silk Sarees","Printed Sarees","Paithani Sarees","Dyed Matching Sarees","Uniform Sarees"],
  "Lehenga": ["Surat Lehenga","Designer Lehenga","Indo Western Lehenga","Party Wear Lehenga","Wedding Lehenga","Bridal Lehenga"],
  "Suit": ["Ladies Designer Suits","Ladies Printed Suits","Embroidered Ladies Suit","Pakistani Suits","Jaipuri Suit","Punjabi Suits","Salwar Suit"],
  "Kurti": ["Surat Kurti","Surat Kurta","Nayra Cut Kurti","Ladies Kurti","Half Sleeve Kurtis","Long Kurti","Lucknowi Kurtis","Handloom Cotton Kurti"],
  "Dupatta": ["Cotton Dupatta","Chiffon Dupatta","Silk Dupatta","Net Dupatta","Velvet Dupatta","Georgette Dupatta","Rayon Dupatta","Satin Dupatta","Linen Dupatta","Printed Dupatta","Plain Dupatta","Embroidery Dupatta"],
  "Blouse": ["Designer Blouse","Ready Made Blouse","Stretchable Blouse","Blouse Pcs"],
  "Petticoat": ["Saree Shapewear Petticoat","Stitch Petticoat","Poplin Petticoat","Poplin Than Petticoat"],
  "Women Bottom Wear": ["Women Pajama","Women Shorts","Women Pants","Women Bottom Jeans","Women Bell Bottom Jeans","Women Leggings","Women Jeggings","Women Palazzo Pants"]
};

const autoSeedProducts = async () => {
    for (const [category, subProducts] of Object.entries(subMap)) {
        for (const sub of subProducts) {
            const exists = await Product.findOne({ category, name: sub });
            if (!exists) {
                await Product.create({
                    category,
                    name: sub,
                    priceBuyRaw: 0,
                    priceBuyReady: 0,
                    priceSaleRaw: 0,
                    priceSaleReady: 0
                });
            }
        }
    }
};

const saveOrUpdateProduct = async (req, res) => {
    const { id, category, name, price } = req.body;

    try {
        const numPrice = Number(price);
        if (id) {
            const product = await Product.findByIdAndUpdate(
                id,
                {
                    category,
                    name,
                    priceBuyRaw: numPrice,
                    priceBuyReady: numPrice,
                    priceSaleRaw: numPrice,
                    priceSaleReady: numPrice
                },
                { new: true }
            );
            res.json(product);
        } else {
            const product = await Product.create({
                category,
                name,
                priceBuyRaw: numPrice,
                priceBuyReady: numPrice,
                priceSaleRaw: numPrice,
                priceSaleReady: numPrice
            });
            res.status(201).json(product);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        await autoSeedProducts();
        const products = await Product.find({}).sort({ category: 1, name: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveOrUpdateProduct,
    getAllProducts
};
