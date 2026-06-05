const Group = require('../../models/messages_models/Group');

module.exports = async (req, res) => {
    try {
        const { name, members, description } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ msg: "Le nom du groupe est obligatoire." });
        }

        const newGroup = new Group({
            name: name.trim(),
            description: description ? description.trim() : "",
            creator: req.user._id,
            members: [...new Set([...(members || []), req.user._id.toString()])], 
            admins: [req.user._id],
            mutedBy: []
        });

        await newGroup.save();
        
        const populatedGroup = await Group.findById(newGroup._id).populate('members', 'name specialty');
        return res.status(201).json(populatedGroup);
    } catch (err) { 
        console.error("❌ Erreur createGroup :", err);
        return res.status(500).json({ msg: "Erreur lors de la création du groupe." }); 
    }
};