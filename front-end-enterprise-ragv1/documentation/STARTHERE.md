Hi so this is the documentation for SuperRAG Frontend.

Here I will aim to explain how to use the app and what it does.

In a nutshell you should be able to get the serverless app running locally and then deploy it to Vercel. You will also need ot set up NEON db and the RAG API servceis. Currently I am using a serverless implementation but you might as well use a local implementation.

I will eventually make the provision for a local implementation but for now I am just going to focus on the serverless implementation.

First lets start with the env variables that you need to set up using .env.local.

1. The first is the databse url : DATABASE_URL which is the url of the NEON db or any Postgres db.
2. The second is the DATABASE_URL_READONLY which can be the same as above, but preferbaly is a readd only Replica of the above Database.
3. Is the NEXTAUTH_URL : this is can be as follows when you run the app locally NEXTAUTH_URL="http://localhost:3000" , else it should be the url of the deployed app.
4. The NEXTAUTH_SECRET is a secret key that is used to sign the session cookie. You can generate one using the following command : openssl rand -base64 32

Externally for Vercel you may need to set up the following variables : 5. The NEXTAUTH_SECRET_KEY is the secret key that is used to sign the session cookie. You can generate one using the following command : openssl rand -base64 32 6. The NEXTAUTH_SECRET_KEY_VERCEL is the secret key that is used to sign the session cookie. You can generate one using the following command : openssl rand -base64 32

Lets start with the Login page as for any enterprise app this is the first page that users will see and it will determine the amount of access they have to the app.
When you first run the app you will see the login page.

Schema for the database is as follows :

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('guest', 'user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
