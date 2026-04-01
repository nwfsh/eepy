CREATE type day_phase AS ENUM ('morning', 'night');
CREATE type media_type AS ENUM ('image', 'video', 'audio', 'text');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    preferred_name TEXT NOT NULL,
    pronouns TEXT NOT NULL,
    timezone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()    /* this is just industry standard */
);

CREATE TABLE sleepSchedule (
    user_id UUID NOT NULL,
    effective_date DATE NOT NULL, 
    timezone TEXT NOT NULL,
    wake_time INTEGER NOT NULL,
    sleep_time INTEGER NOT NULL,
    window INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id,effective_date)    /* this is a weak entity, hence it composes of effective date and user_id to create primary key */
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL,
    user2_id UUID,
    streak_counter INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOT NULL NOW(),

    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE

    CHECK (user1_id <> user2_id OR user2_id IS NULL)    /* ensure user1 and user2 are not the same */
);

CREATE UNIQUE INDEX unique_relationship_pair /* prevents case where user1=A and user2=B, then user2=B and user1=A */
ON relationship (
    LEAST(user1_id::text, user2_id::text),
    GREATEST(user1_id::text, user2_id::text)
)
WHERE user2_id IS NOT NULL;

CREATE TABLE checkin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), /* I made each checkin just have an id, is that easier?? */
    relationship_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type day_phase NOT NULL,
    cycle_date DATE NOT NULL,
    has_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,

    FOREIGN KEY (relationship_id) REFERENCES relationship(id) ON DELETE CASCADE
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

    UNIQUE (relationship_id, user_id, type, cycle_date)
);

CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID NOT NULL,
    from_id UUID NOT NULL,
    to_id UUID NOT NULL,
    type day_phase NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    special_request_text TEXT,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    spent_coins INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (relationship_id) REFERENCES relationship(id) ON DELETE CASCADE
    FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE
    FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE
    
    CHECK (from_id <> to_id)
)

CREATE TABLE message_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    type media_type NOT NULL,
    url TEXT NOT NULL,

    FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE CASCADE
)


