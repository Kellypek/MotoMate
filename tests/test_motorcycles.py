def test_create_motorcycle(client):
    response = client.post("/motorcycles", json={
        "brand": "Honda",
        "model": "RS150R",
        "registration_number": "TEST1234",
        "year": 2024,
        "current_mileage": 5000
    })

    assert response.status_code == 201

    data = response.get_json()

    assert data["message"] == "Motorcycle created successfully."
    assert "id" in data


def test_get_motorcycles(client):
    client.post("/motorcycles", json={
        "brand": "Honda",
        "model": "RS150R",
        "registration_number": "TEST1234",
        "year": 2024,
        "current_mileage": 5000
    })

    response = client.get("/motorcycles")

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["brand"] == "Honda"
    assert data[0]["model"] == "RS150R"
    assert data[0]["registration_number"] == "TEST1234"


def test_update_motorcycle(client):
    create_response = client.post("/motorcycles", json={
        "brand": "Honda",
        "model": "RS150R",
        "registration_number": "TEST1234",
        "year": 2024,
        "current_mileage": 5000
    })

    motorcycle_id = create_response.get_json()["id"]

    response = client.put(
        f"/motorcycles/{motorcycle_id}",
        json={
            "brand": "Honda",
            "model": "RS150R",
            "registration_number": "TEST1234",
            "year": 2024,
            "current_mileage": 6000
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Motorcycle updated successfully."


def test_delete_motorcycle(client):
    create_response = client.post("/motorcycles", json={
        "brand": "Honda",
        "model": "RS150R",
        "registration_number": "TEST1234",
        "year": 2024,
        "current_mileage": 5000
    })

    motorcycle_id = create_response.get_json()["id"]

    response = client.delete(
        f"/motorcycles/{motorcycle_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Motorcycle deleted successfully."