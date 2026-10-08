def calculate_service_status(
    current_mileage,
    service_mileage,
    interval_km
):
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
        "status": status
    }