const Contact = require('../models/Contact');

const addContact = async (req, res) => {
    const { name, phone, email, interest, message } = req.body;

    try {
        const contact = await Contact.create({
            name,
            phone,
            email,
            interest,
            message
        });

        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addContact,
    getAllContacts
};
