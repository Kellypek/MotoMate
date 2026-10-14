
def calculate_service_status(
    current_mileage,
    service_mileage,
    interval_km
):
    values = {
        "current_mileage": current_mileage,
        "service_mileage": service_mileage,
        "interval_km": interval_km,
    }

    for name, value in values.items():
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError(f"{name} must be an integer.")

    if current_mileage < 0:
        raise ValueError("Current mileage cannot be negative.")

    if service_mileage < 0:
        raise ValueError("Service mileage cannot be negative.")

    if interval_km <= 0:
        raise ValueError("Service interval must be greater than zero.")

    next_service = service_mileage + interval_km
    remaining_km = next_service - current_mileage

    if remaining_km <= 0:
        status = "OVERDUE"
    elif remaining_km <= 500:
        status = "DUE SOON"
    else:
        status = "OK"

    return {
        "next_service": next_service,
        "remaining_km": remaining_km,
        "status": status,
    }
