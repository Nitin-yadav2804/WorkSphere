import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});