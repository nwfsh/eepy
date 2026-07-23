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
    tokens INTEGER NOT NULL DEFAULT 0,
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




CREATE TABLE checkins  (
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


CREATE TABLE messages (
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

    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- row level securities
-- usually in databases, when u access a table, u can read every row, but u dont want a user that can access one row
-- to access other rows and read other people's data

alter table users enable row level security;
alter table sleep_schedule enable row level security;
alter table relationship enable row level security;
alter table checkins enable row level security;
alter table messages enable row level security;
alter table message_media enable row level security;

-- policies 
-- every query get filtered by policy , no policies -> no access to table at all 
-- for select -> gives u perms to select the columns
-- for update -> gives u perms to update the column 


-- user policies
create policy "users can read own profile"
    on users for select using (auth.uid() = id);

create policy "users can update their own profile"
    on users for select using (auth.uid() = id);

create policy "users can read partner profile"
    on users for select using (
        id in (
            select case
            when user1_id = auth.uid() then user2_id
            when user2_id = auth.uid() then user1_id
            end 
            from relationship
            where user1_id = auth.uid() or user2_id = auth.uid()
        )
    );

-- sleep policies
create policy "users can manage their own sleep schedule"
    on sleep_schedule for all using (auth.uid() = user_id);

-- relationship policies 
create policy "users can read their relationship"
    on relationship for select using (
        auth.uid() = user1_id or auth.uid() = user2_id
    );

create policy "users can create relationship"
    on relationship for insert with check (auth.uid() = user1_id
    );

create policy "users can update their relationship"
    on relationship for update using (
        auth.uid() = user1_id or auth.uid() = user2_id
    );

-- check in policies 

create policy "users can manage their own checkins"
    on checkins for all using (auth.uid() = id);

create policy "users can read their partner check ins"
    on checkins for select using (relationship_id in
        ( select id from relationship 
        where user1_id = auth.uid() or user2_id = auth.uid()
        )
    );

-- messages policies 

create policy "users can send messages"
    on messages for insert with check ( auth.uid() = from_id);

create policy "users can read messages they sent"
    on messages for select using ( 
        auth.uid() = from_id OR auth.uid() = to_id
    );

create policy "only recipients can unlock their messages"
    on messages for select using (
        auth.uid() = to_id
    );

-- messages media policies 

create policy "users can read the media linked to their messages"
    on messages for select using (
        message_id in (
            select id from messages
            where from_id = auth.uid() OR to_id = auth.uid()
        )
    ); 

create policy "users can insert media for their messages"
    on message_media for insert with check (
 message_id IN (
            SELECT id FROM messages WHERE from_id = auth.uid()
        )
    );