const path = require('path');
const fs = require('fs');

// Fonction pour trouver un fichier récursivement dans le dossier src
function findFile(startPath, filename) {
    const files = fs.readdirSync(startPath);
    for (let file of files) {
        const filepath = path.join(startPath, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            const found = findFile(filepath, filename);
            if (found) return found;
        } else if (file === filename) {
            return filepath;
        }
    }
    return null;
}

const srcDir = path.resolve(__dirname, '..');
const messagePath = findFile(srcDir, 'Message.js');
const groupPath = findFile(srcDir, 'Group.js');

if (!messagePath || !groupPath) {
    throw new Error("Impossible de trouver Message.js ou Group.js. Vérifiez leurs noms !");
}

const Message = require(messagePath);
const Group = require(groupPath);

const getUnreadCountForUser = async (userId) => {
    try {
        if (!userId) return 0;
        const userGroups = await Group.find({ members: userId }).select('_id');
        const groupIds = userGroups.map(g => g._id);

        const unreadCount = await Message.countDocuments({
            groupId: { $in: groupIds },
            readBy: { $ne: userId }
        });
        return unreadCount;
    } catch (error) {
        console.error("Erreur service:", error);
        return 0;
    }
};

module.exports = { getUnreadCountForUser };