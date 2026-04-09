const MerchantBill = require('../models/MerchantBill');

const createBill = async (req, res) => {
    const { merchantUserId, merchantName, merchantPhone, billType, material, lines } = req.body;

    try {
        let grandTotal = 0;
        const formattedLines = lines.map(ln => {
            const amt = Number(ln.qty) * Number(ln.unitPrice);
            grandTotal += amt;
            return {
                productId: ln.productId || null,
                category: ln.category,
                subProduct: ln.name || ln.subProduct,
                unitPrice: Number(ln.unitPrice),
                qty: Number(ln.qty),
                amount: amt
            };
        });

        const bill = await MerchantBill.create({
            merchantUserId: merchantUserId || null,
            merchantName,
            merchantPhone,
            billType,
            material,
            grandTotal,
            lines: formattedLines
        });

        res.status(201).json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllBills = async (req, res) => {
    try {
        const bills = await MerchantBill.find({}).sort({ _id: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBill = async (req, res) => {
    try {
        const bill = await MerchantBill.findById(req.params.id);
        if (bill) res.json(bill);
        else res.status(404).json({ message: 'Bill not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBillLine = async (req, res) => {
    const { billId, lineId, qty, unitPrice } = req.body;

    try {
        const bill = await MerchantBill.findById(billId);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        let line = bill.lines.id(lineId);
        if (line) {
            line.qty = Number(qty);
            line.unitPrice = Number(unitPrice);
            line.amount = line.qty * line.unitPrice;

            bill.grandTotal = bill.lines.reduce((acc, curr) => acc + curr.amount, 0);
            await bill.save();

            res.json(bill);
        } else {
            res.status(404).json({ message: 'Line not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBill = async (req, res) => {
    try {
        await MerchantBill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bill removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBill,
    getAllBills,
    getBill,
    updateBillLine,
    deleteBill
};
