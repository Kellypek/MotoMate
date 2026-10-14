
from flask import Blueprint, request, jsonify
from database import get_connection


motorcycle_bp = Blueprint("motorcycles", __name__)


def is_valid_mileage(value):
    return (
        isinstance(value, int)
        and not isinstance(value, bool)
        and value >= 0
    )


@motorcycle_bp.post("/motorcycles")
def create_motorcycle():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request data."
        }), 400

    brand = data.get("brand")
    model = data.get("model")
    registration_number = data.get("registration_number")
    year = data.get("year")
    current_mileage = data.get("current_mileage", 0)

    if not brand or not model or not registration_number or year is None:
        return jsonify({
            "error": "Brand, model, registration number, and year are required."
        }), 400

    if not is_valid_mileage(current_mileage):
        return jsonify({
            "error": "Current mileage must be a non-negative integer."
        }), 400

    connection = get_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO motorcycles
            (
                brand,
                model,
                registration_number,
                year,
                current_mileage
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            brand,
            model,
            registration_number,
            year,
            current_mileage
        ))

        connection.commit()

        return jsonify({
            "message": "Motorcycle created successfully.",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 400

    finally:
        connection.close()


@motorcycle_bp.get("/motorcycles")
def get_motorcycles():
    connection = get_connection()

    try:
        motorcycles = connection.execute("""
            SELECT
                id,
                brand,
                model,
                registration_number,
                year,
                current_mileage,
                created_at
            FROM motorcycles
            ORDER BY id
        """).fetchall()

        return jsonify([
            dict(motorcycle)
            for motorcycle in motorcycles
        ])

    finally:
        connection.close()


@motorcycle_bp.put("/motorcycles/<int:motorcycle_id>")
def update_motorcycle(motorcycle_id):
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request data."
        }), 400

    brand = data.get("brand")
    model = data.get("model")
    registration_number = data.get("registration_number")
    year = data.get("year")
    current_mileage = data.get("current_mileage")

    if (
        not brand
        or not model
        or not registration_number
        or year is None
        or current_mileage is None
    ):
        return jsonify({
            "error": (
                "Brand, model, registration number, year, "
                "and current mileage are required."
            )
        }), 400

    if not is_valid_mileage(current_mileage):
        return jsonify({
            "error": "Current mileage must be a non-negative integer."
        }), 400

    connection = get_connection()

    try:
        existing_motorcycle = connection.execute("""
            SELECT id, current_mileage
            FROM motorcycles
            WHERE id = ?
        """, (motorcycle_id,)).fetchone()

        if existing_motorcycle is None:
            return jsonify({
                "error": "Motorcycle not found."
            }), 404

        if current_mileage < existing_motorcycle["current_mileage"]:
            return jsonify({
                "error": (
                    "Current mileage cannot be lower "
                    "than the existing mileage."
                )
            }), 400

        connection.execute("""
            UPDATE motorcycles
            SET
                brand = ?,
                model = ?,
                registration_number = ?,
                year = ?,
                current_mileage = ?
            WHERE id = ?
        """, (
            brand,
            model,
            registration_number,
            year,
            current_mileage,
            motorcycle_id
        ))

        connection.commit()

        return jsonify({
            "message": "Motorcycle updated successfully."
        }), 200

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 400

    finally:
        connection.close()


@motorcycle_bp.delete("/motorcycles/<int:motorcycle_id>")
def delete_motorcycle(motorcycle_id):
    connection = get_connection()

    try:
        existing_motorcycle = connection.execute("""
            SELECT id
            FROM motorcycles
            WHERE id = ?
        """, (motorcycle_id,)).fetchone()

        if existing_motorcycle is None:
            return jsonify({
                "error": "Motorcycle not found."
            }), 404

        connection.execute("""
            DELETE FROM motorcycles
            WHERE id = ?
        """, (motorcycle_id,))

        connection.commit()

        return jsonify({
            "message": "Motorcycle deleted successfully."
        }), 200

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 400

    finally:
        connection.close()
