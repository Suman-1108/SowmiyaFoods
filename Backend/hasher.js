import bcrypt from "bcryptjs";

const hashedPassword = await bcrypt.hash("sowmiyafoods@2025", 10);
console.log(hashedPassword);
