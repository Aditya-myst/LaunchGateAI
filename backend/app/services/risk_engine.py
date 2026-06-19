def score_risk(flags: dict[str, bool]) -> tuple[int, str]:
    weights = {
        "processes_pii": 20,
        "external_llm_vendor": 15,
        "missing_disclosure": 10,
        "raw_payload_logging": 25,
        "missing_regression_tests": 15,
        "no_rollback_plan": 15,
        "customer_facing": 10,
        "critical_security_finding": 25,
        "vendor_retention_unclear": 10,
    }

    score = min(100, sum(weight for key, weight in weights.items() if flags.get(key)))

    if score <= 20:
        level = "Low"
    elif score <= 50:
        level = "Medium"
    elif score <= 75:
        level = "High"
    else:
        level = "Critical"

    return score, level
