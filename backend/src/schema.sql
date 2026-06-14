-- EEPY — Database Schema


CREATE TYPE day_phase  AS ENUM ('morning', 'night');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'text');

CREATE TABLE users (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, 
    email           TEXT        UNIQUE NOT NULL,    
    first_name      TEXT        NOT NULL,
    last_name       TEXT        NOT NULL,
    preferred_name  TEXT        NOT NULL,
    pronouns        TEXT        NOT NULL,
    timezone        TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- function that autofill ur users table you have for urself , when supabase registers a new person to ur app


-- trigger makes it happen automatically
-- new refers the new user row created and inserted in 
-- coalesce means use this value, but if null, use the other value instead

CREATE or REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql security definer set search_path = public as $$
    begin insert into users (id, email, first_name, last_name, preferred_name, pronouns, timezone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'preferred_name', ''),
    coalesce(new.raw_user_meta_data->>'pronouns', ''),
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


CREATE TABLE sleep_schedule (                    
    user_id         UUID        NOT NULL,
    effective_date  DATE        NOT NULL,
    timezone        TEXT        NOT NULL,
    wake_time       INTEGER     NOT NULL,
    sleep_time      INTEGER     NOT NULL,
    theWindow       INTEGER     NOT NULL, -- rmb in minutes   
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, effective_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE relationship (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user1_id        UUID        NOT NULL,
    user2_id        UUID,
    streak_counter  INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (user1_id <> user2_id OR user2_id IS NULL)
);

-- prevents A + B and B + A being a different relationship when its the same 
CREATE UNIQUE INDEX unique_relationship_pair
ON relationship (
    LEAST(user1_id::text,    user2_id::text),
    GREATEST(user1_id::text, user2_id::text)
)
WHERE user2_id IS NOT NULL;




CREATE TABLE checkin (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id  UUID        NOT NULL,
    user_id          UUID        NOT NULL,
    phase            day_phase   NOT NULL,     
    cycle_date       DATE        NOT NULL,
    has_checked_in   BOOLEAN     NOT NULL DEFAULT FALSE,
    checked_in_at    TIMESTAMPTZ,

    FOREIGN KEY (relationship_id) REFERENCES relationship(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)         REFERENCES users(id)        ON DELETE CASCADE,
    UNIQUE (relationship_id, user_id, phase, cycle_date)       
);


CREATE TABLE message (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id      UUID        NOT NULL,
    from_id              UUID        NOT NULL,
    to_id                UUID        NOT NULL,
    phase                day_phase   NOT NULL,  
    sent_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    special_request_text TEXT,
    unlocked             BOOLEAN     NOT NULL DEFAULT FALSE,
    spent_coins          INTEGER     NOT NULL DEFAULT 0,

    FOREIGN KEY (relationship_id) REFERENCES relationship(id) ON DELETE CASCADE,
    FOREIGN KEY (from_id)         REFERENCES users(id)        ON DELETE CASCADE,
    FOREIGN KEY (to_id)           REFERENCES users(id)        ON DELETE CASCADE,
    CHECK (from_id <> to_id)
);



CREATE TABLE message_media (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID        NOT NULL,
    media_type       media_type  NOT NULL,          
    url         TEXT        NOT NULL,

    FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE CASCADE
);