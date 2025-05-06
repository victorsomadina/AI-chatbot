import { User } from './schema.js';
import user from './db.js';
import bcrypt from 'bcryptjs';

// migrate array to a database
const populateUser = async () => {
    try {
        for (const userData of user) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData
            });
        }
    } catch (error) {
        console.error('Error populating user table:', error);
    }
};

export default populateUser;