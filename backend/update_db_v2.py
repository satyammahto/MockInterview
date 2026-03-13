import sqlite3
import os

db_path = "prepsense.db"

def update_schema():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Columns to add to feedback_reports
    report_columns = [
        ("technical_score", "FLOAT"),
        ("grammar_score", "FLOAT"),
        ("communication_score", "FLOAT"),
        ("feedback_summary", "TEXT"),
        ("prep_tips", "JSON"),
        ("learning_resources", "JSON")
    ]

    for col_name, col_type in report_columns:
        try:
            cursor.execute(f"ALTER TABLE feedback_reports ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name} to feedback_reports")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists in feedback_reports")
            else:
                print(f"Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Database update complete.")

if __name__ == "__main__":
    update_schema()
