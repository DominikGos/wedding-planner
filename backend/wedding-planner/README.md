# Database Connection (Oracle via Docker)

## Start the Database

From the **backend folder root**, start the Oracle database container:

```bash
docker compose up -d
```

Wait until the database is fully initialized (first startup may take 1–3 minutes).

You can check logs with:

```bash
docker logs -f oracle-db
```

Look for:

```
DATABASE IS READY TO USE!
```

---

## Connect to the Database (SQL Terminal)

To run SQL queries inside the Oracle container:

```bash
docker exec -it oracle-db sqlplus myuser/mypassword@XEPDB1
```

After connecting, you can run SQL commands like:

```sql
SELECT table_name FROM user_tables;
```

---

## Stop the Database

To stop the container:

```bash
docker compose down
```

To remove data (reset database):

```bash
docker compose down -v
```

⚠️ This deletes all stored database data.
