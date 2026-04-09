const Work = require('../models/Work');
const WorkOptionPrice = require('../models/WorkOptionPrice');

// Ensure default options
const seedDefaultOptions = async () => {
    const defaults = ["Lace Sewing", "Diamond Work", "Iron Work"];
    for (const name of defaults) {
        const ext = await WorkOptionPrice.findOne({ optionName: name });
        if (!ext) {
            await WorkOptionPrice.create({ optionName: name, price: 0 });
        }
    }
};

const getWorkOptionPrices = async (req, res) => {
    try {
        await seedDefaultOptions();
        const options = await WorkOptionPrice.find({}).sort({ optionName: 1 });
        res.json(options);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const setWorkOptionPrice = async (req, res) => {
    const { optionName, price } = req.body;
    try {
        await seedDefaultOptions();
        const opt = await WorkOptionPrice.findOneAndUpdate(
            { optionName: optionName.trim() },
            { price: Number(price) },
            { new: true, upsert: true }
        );
        res.json(opt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addWork = async (req, res) => {
    const { date, workType, subProduct, workOption, quantity } = req.body;
    const userId = req.user.id;

    try {
        await seedDefaultOptions();
        const opt = await WorkOptionPrice.findOne({ optionName: workOption });
        const price = opt ? opt.price : 0;
        const totalSalary = price * Number(quantity);

        const work = await Work.create({
            user: userId,
            date: date || new Date().toISOString().split('T')[0],
            workType,
            subProduct: subProduct || '',
            workOption,
            quantity: Number(quantity),
            price,
            totalSalary
        });

        res.status(201).json(work);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWorkByUserAndDate = async (req, res) => {
    const { userId, date } = req.query;
    try {
        const works = await Work.find({ user: userId, date }).sort({ _id: -1 });
        res.json(works);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllWorkEntries = async (req, res) => {
    try {
        const works = await Work.find({}).populate('user', 'name phone').sort({ _id: -1 });
        res.json(works);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateWorkEntry = async (req, res) => {
    const { id } = req.params;
    const { date, workType, subProduct, workOption, quantity, price } = req.body;

    try {
        const totalSalary = Number(price) * Number(quantity);
        const work = await Work.findByIdAndUpdate(
            id,
            { date, workType, subProduct, workOption, quantity: Number(quantity), price: Number(price), totalSalary },
            { new: true }
        );
        res.json(work);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteWorkEntry = async (req, res) => {
    const { id } = req.params;
    try {
        await Work.findByIdAndDelete(id);
        res.json({ message: 'Work removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWorkSummaryByRange = async (req, res) => {
    const { userId, fromDate, toDate } = req.query;
    try {
        const works = await Work.find({
            user: userId,
            date: { $gte: fromDate, $lte: toDate }
        });
        
        const summaryMap = {};
        works.forEach(w => {
            if (!summaryMap[w.date]) {
                summaryMap[w.date] = { date: w.date, total_qty: 0, total_amount: 0 };
            }
            summaryMap[w.date].total_qty += Number(w.quantity) || 0;
            summaryMap[w.date].total_amount += Number(w.totalSalary) || 0;
        });

        const summary = Object.values(summaryMap).sort((a, b) => b.date.localeCompare(a.date));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWorkOptionPrices,
    setWorkOptionPrice,
    addWork,
    getWorkByUserAndDate,
    getAllWorkEntries,
    updateWorkEntry,
    deleteWorkEntry,
    getWorkSummaryByRange
};
