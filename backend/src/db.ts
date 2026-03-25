import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DATABASE_URL!); // basically takes ur database from the env file and runs it 
export default sql;