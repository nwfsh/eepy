import bcrypt from "bcrypt";
import sql from "../db";

export const register = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    preferred_name: string,
    pronouns: string,
    timezone: string,
) => {
    const hashed = await bcrypt.hash(password, 10) // 10 representes how hard it is to crack passoword, its the industry standard

    const [user] = await sql`
    INSERT INTO users(email,password,first_name,last_name,preferred_name,pronouns,timezone)
    VALUES(${email}, ${hashed},${first_name}, ${last_name}, ${preferred_name}, ${pronouns}, ${timezone})
    RETURNING id, email, first_name, last_name, preferred_name, pronouns, timezone`

    return user;
    // notice we dont return password on purpose 
}

export const signIn = async (
    email: string,
    password: string,
) => {

    const [user] = await sql`
    SELECT * FROM users WHERE email = ${email}`

    if (!user) throw new Error("Invalid email or password") // never reveal if email actually exists or not, security thing !! 

    const valid = await bcrypt.compare(password, user.password)

    if(!valid) throw new Error("Invalid email or password")

    return {
        id: user.id,
        email: user.email,
        preferred_name: user.preferred_name,
        pronouns: user.pronouns,
        timezone: user.timezone
    }
}
