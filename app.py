from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

DATABASE = "database.db"


# Database connection
def connect_db():
    return sqlite3.connect(DATABASE)


# Create database table
def create_table():
    conn = connect_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS password_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL,
            strength TEXT NOT NULL,
            password_length INTEGER NOT NULL,
            tested_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Save password testing results
@app.route("/save", methods=["POST"])
def save_result():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    try:
        score = int(data["score"])
        strength = str(data["strength"])
        length = int(data["length"])

        if not 0 <= score <= 100 or not 0 <= length <= 10000:
            return jsonify({"error": "Invalid values"}), 400

        if strength not in ["Weak", "Medium", "Strong"]:
            return jsonify({"error": "Invalid strength"}), 400

    except (KeyError, ValueError, TypeError):
        return jsonify({"error": "Invalid data"}), 400

    conn = connect_db()

    conn.execute("""
        INSERT INTO password_tests
        (score, strength, password_length, tested_at)
        VALUES (?, ?, ?, ?)
    """, (
        score,
        strength,
        length,
        datetime.now().strftime("%d-%m-%Y %H:%M")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Security test saved successfully!"
    })


# Display testing history
@app.route("/history")
def history():

    conn = connect_db()

    records = conn.execute("""
        SELECT score, strength, password_length, tested_at
        FROM password_tests
        ORDER BY id DESC
        LIMIT 10
    """).fetchall()

    conn.close()

    return jsonify(records)


if __name__ == "__main__":

    create_table()

    app.run(debug=True)