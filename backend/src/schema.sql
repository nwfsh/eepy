CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT NOT NULL,
    pronouns TEXT NOT NULL,
    timezone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() {/* this is just industry standard */}
);


CREATE TABLE sleepSchedule (
    user_id TEXT NOT NULL,
    effective_date DATE NOT NULL, 
    timezone TEXT NOT NULL,
    wake_time INTEGER NOT NULL,
    sleep_time INTEGER NOT NULL,
    window INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id,effective_date) {/* this is a weak entity, hence it composes of effective date and user_id to create primary key */}
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

