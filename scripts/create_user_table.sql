CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created_date TIMESTAMP,
    updated_date TIMESTAMP
);

-- Example of inserting a user with an encrypted password and timestamps
INSERT INTO "user" (email, first_name, last_name, password, created_date, updated_date)
VALUES ('example2@example.com', 'FirstName', 'LastName', 'crypt(password, gen_salt(bf)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
